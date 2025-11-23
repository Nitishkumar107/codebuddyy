"use client";

import { useState } from 'react';
import { Sparkles, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import GenerationProgress from '@/components/ai-coder/generation-progress';

const EXAMPLE_PROMPTS = [
    "Create a Todo app with React, TypeScript, and local storage",
    "Build a weather dashboard using Next.js 14 and OpenWeather API",
    "Make a simple Express REST API with MongoDB for a blog",
    "Create a landing page with Tailwind CSS and dark mode support",
    "Build a calculator app with React and styled-components"
];

interface AiCoderPanelProps {
    onGenerate?: (prompt: string) => void;
}

const AiCoderPanel = ({ onGenerate }: AiCoderPanelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationLogs, setGenerationLogs] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim() || !isEnabled) return;

        setIsGenerating(true);
        setGenerationLogs([]);

        try {
            const response = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Generation failed');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));

                                if (data.type === 'log') {
                                    setGenerationLogs(prev => [...prev, data.message]);
                                } else if (data.type === 'complete') {
                                    setGenerationLogs(prev => [...prev, `✅ Project created! ID: ${data.playgroundId}`]);
                                    // Redirect to playground
                                    if (data.playgroundId) {
                                        window.location.href = `/playground/${data.playgroundId}`;
                                    }
                                } else if (data.type === 'error') {
                                    setGenerationLogs(prev => [...prev, `❌ Error: ${data.message}`]);
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            setGenerationLogs(prev => [...prev, `❌ Error: ${error.message}`]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExampleClick = (example: string) => {
        setPrompt(example);
    };

    return (
        <>
            {/* Floating AI Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-110"
                >
                    {isOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Sparkles className="h-6 w-6" />
                    )}
                </Button>
            </div>

            {/* AI Coder Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-[500px] max-h-[600px]">
                    <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-800">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    <CardTitle>AI Coder</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="ai-toggle" className="text-sm">
                                        {isEnabled ? 'On' : 'Off'}
                                    </Label>
                                    <Switch
                                        id="ai-toggle"
                                        checked={isEnabled}
                                        onCheckedChange={setIsEnabled}
                                    />
                                </div>
                            </div>
                            <CardDescription>
                                Describe your project and let AI build it for you
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 space-y-4">
                            {!isGenerating ? (
                                <>
                                    {/* Project Description Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="project-prompt">
                                            Describe your project in plain English
                                        </Label>
                                        <Textarea
                                            id="project-prompt"
                                            placeholder="e.g., Create a Todo app with React and TypeScript..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            disabled={!isEnabled}
                                            className="min-h-[100px] resize-none"
                                        />
                                    </div>

                                    {/* Example Prompts */}
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Try these examples:
                                        </Label>
                                        <ScrollArea className="h-[120px] rounded-md border p-2">
                                            <div className="space-y-1">
                                                {EXAMPLE_PROMPTS.map((example, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleExampleClick(example)}
                                                        disabled={!isEnabled}
                                                        className="w-full text-left text-xs p-2 rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {example}
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Generate Button */}
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={!prompt.trim() || !isEnabled}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Project
                                    </Button>
                                </>
                            ) : (
                                <GenerationProgress logs={generationLogs} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};

export default AiCoderPanel;
