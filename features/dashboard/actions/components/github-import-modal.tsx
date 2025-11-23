"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface GithubImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GithubImportModal = ({ isOpen, onClose }: GithubImportModalProps) => {
    const [repoUrl, setRepoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validateGithubUrl = (url: string): boolean => {
        const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
        return githubUrlPattern.test(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!repoUrl.trim()) {
            toast.error('Please enter a repository URL');
            return;
        }

        if (!validateGithubUrl(repoUrl)) {
            toast.error('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/github-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to import repository');
            }

            toast.success('Repository imported successfully!');
            onClose();
            setRepoUrl('');

            // Redirect to the new playground
            if (data.playgroundId) {
                router.push(`/playground/${data.playgroundId}`);
            }
        } catch (error: any) {
            console.error('Import error:', error);
            toast.error(error.message || 'Failed to import repository');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setRepoUrl('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        Import GitHub Repository
                    </DialogTitle>
                    <DialogDescription>
                        Enter the URL of a public GitHub repository to import it into CodeBuddy.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="repo-url">Repository URL</Label>
                        <Input
                            id="repo-url"
                            type="url"
                            placeholder="https://github.com/username/repository"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            disabled={isLoading}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Example: https://github.com/vercel/next.js
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                'Import Repository'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default GithubImportModal;
