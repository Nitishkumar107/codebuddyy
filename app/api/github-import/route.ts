import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/features/auth/action';
import { db } from '@/lib/db';
import { Template } from '@prisma/client';
import { revalidatePath } from 'next/cache';

interface GitHubTreeItem {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
}

interface GitHubTree {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

interface FileContent {
    path: string;
    content: string;
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const user = await currentUser();
        if (!user || !user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { repoUrl } = body;

        if (!repoUrl) {
            return NextResponse.json(
                { error: 'Repository URL is required' },
                { status: 400 }
            );
        }

        // Extract owner and repo from GitHub URL
        const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!urlMatch) {
            return NextResponse.json(
                { error: 'Invalid GitHub URL format' },
                { status: 400 }
            );
        }

        const [, owner, repoName] = urlMatch;
        const cleanRepoName = repoName.replace(/\.git$/, '');

        // Fetch repository information
        const repoInfoResponse = await fetch(
            `https://api.github.com/repos/${owner}/${cleanRepoName}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'CodeBuddy-App'
                }
            }
        );

        if (!repoInfoResponse.ok) {
            if (repoInfoResponse.status === 404) {
                return NextResponse.json(
                    { error: 'Repository not found' },
                    { status: 404 }
                );
            }
            throw new Error('Failed to fetch repository information');
        }

        const repoInfo = await repoInfoResponse.json();
        const defaultBranch = repoInfo.default_branch || 'main';

        // Fetch repository tree
        const treeResponse = await fetch(
            `https://api.github.com/repos/${owner}/${cleanRepoName}/git/trees/${defaultBranch}?recursive=1`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'CodeBuddy-App'
                }
            }
        );

        if (!treeResponse.ok) {
            throw new Error('Failed to fetch repository tree');
        }

        const treeData: GitHubTree = await treeResponse.json();

        // Filter only files (not directories) and limit to reasonable size
        const files = treeData.tree
            .filter(item => item.type === 'blob' && item.size && item.size < 1000000) // Max 1MB per file
            .slice(0, 100); // Limit to 100 files

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No files found in repository' },
                { status: 400 }
            );
        }

        // Fetch file contents
        const fileContentsPromises = files.map(async (file) => {
            try {
                const contentResponse = await fetch(
                    `https://api.github.com/repos/${owner}/${cleanRepoName}/contents/${file.path}?ref=${defaultBranch}`,
                    {
                        headers: {
                            'Accept': 'application/vnd.github.v3.raw',
                            'User-Agent': 'CodeBuddy-App'
                        }
                    }
                );

                if (contentResponse.ok) {
                    const content = await contentResponse.text();
                    return {
                        path: file.path,
                        content
                    };
                }
                return null;
            } catch (error) {
                console.error(`Failed to fetch ${file.path}:`, error);
                return null;
            }
        });

        const fileContents = await Promise.all(fileContentsPromises);

        // Filter out failed fetches
        const validFiles = fileContents.filter((f): f is FileContent => f !== null);

        if (validFiles.length === 0) {
            return NextResponse.json(
                { error: 'Failed to fetch file contents' },
                { status: 500 }
            );
        }

        // Detect template type based on files
        const template = detectTemplate(validFiles);

        // Create file structure for storage
        const fileStructure = validFiles.reduce((acc, file) => {
            acc[file.path] = file.content;
            return acc;
        }, {} as Record<string, string>);

        // Create playground
        const playground = await db.playground.create({
            data: {
                title: `${cleanRepoName} (imported)`,
                description: repoInfo.description || `Imported from ${owner}/${cleanRepoName}`,
                template,
                userId: user.id,
                templateFiles: {
                    create: {
                        content: fileStructure
                    }
                }
            }
        });

        // Revalidate dashboard to show new playground
        revalidatePath('/dashboard');

        return NextResponse.json({
            success: true,
            playgroundId: playground.id,
            filesImported: validFiles.length
        });

    } catch (error: any) {
        console.error('GitHub import error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to import repository' },
            { status: 500 }
        );
    }
}

function detectTemplate(files: FileContent[]): Template {
    const filePaths = files.map(f => f.path.toLowerCase());
    const fileContents = files.map(f => f.content).join('\n');

    // Check for Next.js
    if (filePaths.some(p => p.includes('next.config')) || fileContents.includes('next/')) {
        return 'NEXTJS';
    }

    // Check for React
    if (filePaths.some(p => p.includes('package.json'))) {
        const packageJson = files.find(f => f.path.toLowerCase().includes('package.json'));
        if (packageJson && packageJson.content.includes('"react"')) {
            return 'REACTJS';
        }
    }

    // Check for Vue
    if (filePaths.some(p => p.endsWith('.vue')) || fileContents.includes('vue')) {
        return 'VUE';
    }

    // Check for Angular
    if (filePaths.some(p => p.includes('angular.json')) || fileContents.includes('@angular')) {
        return 'ANGULAR';
    }

    // Check for Svelte
    if (filePaths.some(p => p.endsWith('.svelte')) || fileContents.includes('svelte')) {
        return 'SVELTE';
    }

    // Check for Express
    if (fileContents.includes('express')) {
        return 'EXPRESS';
    }

    // Default to JavaScript
    return 'JavaScript';
}
