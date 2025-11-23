"use client";

import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
    logs: string[];
}

const GenerationProgress = ({ logs }: GenerationProgressProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-sm font-medium">Generating your project...</span>
            </div>

            <Progress value={logs.length * 10} className="w-full" />

            <ScrollArea className="h-[300px] rounded-md border p-3 bg-slate-50 dark:bg-slate-950">
                <div className="space-y-1 font-mono text-xs">
                    {logs.length === 0 ? (
                        <div className="text-muted-foreground">Initializing AI Coder...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div
                                key={index}
                                className={`${log.startsWith('✅')
                                        ? 'text-green-600 dark:text-green-400'
                                        : log.startsWith('❌')
                                            ? 'text-red-600 dark:text-red-400'
                                            : log.startsWith('📝')
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-foreground'
                                    }`}
                            >
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default GenerationProgress;
