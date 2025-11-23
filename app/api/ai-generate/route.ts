import { NextRequest } from 'next/server';
import { currentUser } from '@/features/auth/action';
import { db } from '@/lib/db';
import { ollamaService } from '@/lib/ai-service';
import { Template } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper to create SSE (Server-Sent Events) response
function createSSEResponse() {
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController;
    let isClosed = false;

    const stream = new ReadableStream({
        start(c) {
            controller = c;
        },
    });

    const send = (data: any) => {
        if (isClosed) return;
        try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
        } catch (error) {
            console.error('Error sending SSE:', error);
        }
    };

    const close = () => {
        if (isClosed) return;
        isClosed = true;
        try {
            controller.close();
        } catch (error) {
            console.error('Error closing stream:', error);
        }
    };

    return { stream, send, close };
}

export async function POST(request: NextRequest) {
    const { stream, send, close } = createSSEResponse();

    // Run generation in background
    (async () => {
        try {
            // Check authentication
            const user = await currentUser();
            if (!user || !user.id) {
                send({ type: 'error', message: 'Unauthorized' });
                close();
                return;
            }

            const body = await request.json();
            const { prompt } = body;

            if (!prompt || typeof prompt !== 'string') {
                send({ type: 'error', message: 'Invalid prompt' });
                close();
                return;
            }

            send({ type: 'log', message: '🔍 Analyzing your project requirements...' });

            // Check if Ollama is running
            const isOllamaRunning = await ollamaService.healthCheck();
            if (!isOllamaRunning) {
                send({
                    type: 'error',
                    message: 'Ollama is not running. Please start Ollama with: ollama serve'
                });
                close();
                return;
            }

            send({ type: 'log', message: '🤖 AI is generating your project structure...' });

            // Generate project using Ollama
            let projectStructure;
            try {
                projectStructure = await ollamaService.generateProject(prompt);
            } catch (error: any) {
                send({
                    type: 'error',
                    message: `Failed to generate project: ${error.message}`
                });
                close();
                return;
            }

            send({
                type: 'log',
                message: `📦 Project: ${projectStructure.projectName}`
            });
            send({
                type: 'log',
                message: `📚 Tech Stack: ${projectStructure.techStack.join(', ')}`
            });
            send({
                type: 'log',
                message: `📝 Generating ${projectStructure.files.length} files...`
            });

            // Detect template type
            const template = detectTemplate(projectStructure.techStack);

            // Create file structure for storage
            const fileStructure: Record<string, string> = {};

            // Add package.json if dependencies exist
            if (Object.keys(projectStructure.dependencies || {}).length > 0) {
                const packageJson = {
                    name: projectStructure.projectName,
                    version: '1.0.0',
                    description: projectStructure.description,
                    scripts: projectStructure.scripts || {},
                    dependencies: projectStructure.dependencies || {},
                    devDependencies: projectStructure.devDependencies || {},
                };
                fileStructure['package.json'] = JSON.stringify(packageJson, null, 2);
                send({ type: 'log', message: '✅ Created package.json' });
            }

            // Add all generated files
            for (const file of projectStructure.files) {
                fileStructure[file.path] = file.content;
                send({ type: 'log', message: `✅ Created ${file.path}` });
            }

            // Add README.md with setup instructions
            const setupInstructions = projectStructure.setupInstructions || [
                'Install dependencies with npm install',
                'Run the project with npm run dev'
            ];

            const readmeContent = `# ${projectStructure.projectName}

${projectStructure.description}

## Tech Stack

${projectStructure.techStack.map((tech: string) => `- ${tech}`).join('\n')}

## Setup Instructions

${setupInstructions.map((instruction: string, i: number) => `${i + 1}. ${instruction}`).join('\n')}

## Generated by CodeBuddy AI Coder

This project was automatically generated using AI. Feel free to modify and extend it!
`;
            fileStructure['README.md'] = readmeContent;
            send({ type: 'log', message: '✅ Created README.md' });

            send({ type: 'log', message: '💾 Saving project to database...' });

            // Create playground in database
            const playground = await db.playground.create({
                data: {
                    title: projectStructure.projectName,
                    description: projectStructure.description,
                    template,
                    userId: user.id,
                    templateFiles: {
                        create: {
                            content: fileStructure
                        }
                    }
                }
            });

            send({
                type: 'log',
                message: `✅ Project created successfully!`
            });

            send({
                type: 'complete',
                playgroundId: playground.id,
                filesCreated: Object.keys(fileStructure).length
            });

        } catch (error: any) {
            console.error('AI generation error:', error);
            send({
                type: 'error',
                message: error.message || 'An unexpected error occurred'
            });
        } finally {
            close();
        }
    })();

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

function detectTemplate(techStack: string[]): Template {
    const stackLower = techStack.map(t => t.toLowerCase()).join(' ');

    if (stackLower.includes('next.js') || stackLower.includes('nextjs')) {
        return 'NEXTJS';
    }
    if (stackLower.includes('react')) {
        return 'REACTJS';
    }
    if (stackLower.includes('vue')) {
        return 'VUE';
    }
    if (stackLower.includes('angular')) {
        return 'ANGULAR';
    }
    if (stackLower.includes('svelte')) {
        return 'SVELTE';
    }
    if (stackLower.includes('express') || stackLower.includes('node')) {
        return 'EXPRESS';
    }

    return 'JavaScript';
}
