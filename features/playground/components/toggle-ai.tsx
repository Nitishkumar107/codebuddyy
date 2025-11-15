// D:\vscodedata\codebuddy\features\playground\components\toggle-ai.tsx

"use client"
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { Progress } from '@radix-ui/react-progress';
import { Badge } from '@/components/ui/badge';
import React, { useState } from 'react'
import {Bot,Code, FileText, Import, Loader2, Power, PowerOff, Braces, Variable } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu';
import { string } from 'zod';
//import { languages, Position } from 'monaco-editor';
import AIChatSidePanel from '@/features/ai-chat/components/ai-chat-sidepanel';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    } from "@/components/ui/drawer";
import dynamic from 'next/dynamic';

// Dynamic imports for components that use window
//const AIChatSidePanel = dynamic(() => import('@/features/ai-chat/components/ai-chat-sidepanel'), { ssr: false });
const MonacoEditor = dynamic(() => import('react-monaco-editor'), { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">Loading editor...</div>
});

// Import the custom hook
import { useMonacoEditor } from '@/features/playground/hooks/use-monaco-editor';


interface ToggleAIProps{
    isEnabled:boolean;
    onToggle: (value: boolean)=> void
    suggestionLoading: boolean;
    loadingProgress?: number;
    activeFeature? : string
}

const ToggleAI = ({
    isEnabled ,
    onToggle,
    suggestionLoading,
    loadingProgress = 0,
    activeFeature
        }:ToggleAIProps) => {
            const [isChatOpen, setIsChatOpen]=  useState(false);
            const handleInsertCode = (code: string, fileName?: string, position?: {line: number; column: number}) => {
                // for now, just log the code and info
                console.log("Insert code:", {code, fileName, position});
            };
            const handleRunCode = (code: string, Language:string) => {
                console.log("Run code:", {code, Language});
}
            // Dummy activeFile and cursorPosition for demonstration
            const activeFile = { name: "example.ts", content: "// file content" };
            const cursorPosition = { line: 1, column: 1 };
return (
    <>
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                size={"sm"}
                variant={isEnabled ? "default" : "outline"}
                className={cn('relative gap h-8 px-3 text-sm font-medium transition-all duration-200',
                    isEnabled ? "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-purple-500 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    : "bg-background hover:bg-accent text-foreground border-border",
                    suggestionLoading && "opacity-75"
                )}
                onClick={(e) => e.preventDefault()}
            >
                {suggestionLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin'/>
                ) : (
                    <Bot className='h-4 w-4 text-purple-600 dark:text-purple-400'/>
                )}
                <span>AI</span>
                {
                    isEnabled ? (
                        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'/>
                    ) : (
                        <div className='w-2 h-2 bg-red-500 rounded-full animate-spin'/>
                    )
                }
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className='w-72'>
            <DropdownMenuLabel className='flex items-center justify-between py-2'>
                <div className='flex items-center gap-2'>
                    <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400"></Bot>
                    <span className='text-sm font-medium text-purple-900 dark:text-purple-100'>AI Assistant</span>
                </div>
                <Badge
                    variant="outline"
                    className={cn('relative gap h-8 px-3 text-sm font-medium transition-all duration-200',
                        isEnabled ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-green-500 dark:from-green-700 dark:to-green-600 dark:hover:from-green-900 dark:hover:to-green-400"
                        : "bg-background hover:bg-accent text-foreground border-border",
                        suggestionLoading && "opacity-75"
                    )}>
                    {isEnabled ? "Active" : "Inactive"}
                </Badge>
            </DropdownMenuLabel>
            {
                suggestionLoading && activeFeature && (
                    <div className='px-3 pb-3'>
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between text-muted-foreground'>
                                <span className='text-purple-900 dark:text-purple-100'>{activeFeature}</span>
                                <span className='text-purple-900 dark:text-purple-100'>{Math.round(loadingProgress)}%</span>
                            </div>
                            <progress 
                                value={loadingProgress}
                                className='h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full'
                                style={{ 
                                    '--tw-bg-opacity': '1',
                                    backgroundColor: 'rgba(209, 213, 219, 1)'
                                } as React.CSSProperties}
                            />
                        </div>
                    </div>
                )
            }
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={() => onToggle(!isEnabled)}
                className="py-2.5 cursor-pointer"
            >
                <div className='flex items-center justify-between w-full'>
                    <div className='flex items-center gap-3'>
                        {
                            isEnabled ? (
                                <Power className='size-4 text-green-600 dark:text-green-400'/>
                            ) : (
                                <PowerOff className='size-4 text-red-600 dark:text-red-400'/>
                            )
                        }
                        <div className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                            {isEnabled ? "Disable" : "Enable"} AI
                        </div>
                        <div className='text-sx text-purple-600 dark:text-purple-400'>
                            AI Buddy
                        </div>
                    </div>
                    <div className={cn('w-8 h-4 rounded-full border transition-all duration-200 relative',
                        isEnabled
                        ? "bg-green-200 border-green-400 dark:bg-green-700 dark:border-green-600"
                        : "bg-gray-200 border-gray-400 dark:bg-gray-700 dark:border-gray-600")}>
                        <div className={cn('w-3 h-3 rounded-full bg-white transition-all duration-200 absolute top-0.5', 
                            isEnabled ? "left-4" : "left-0.5"
                        )}>
                        </div>
                    </div>
                </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem 
                onClick={() => setIsChatOpen(true)}
                className='py-2.5 cursor-pointer'
            >
                <div className='flex items-center gap-3 w-full'>
                    <FileText className='size-4 text-purple-600 dark:text-purple-400'/>
                    <div>
                        <div className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                            Open Chat
                        </div>
                        <div className='text-xs text-muted-foreground'>
                            Chat with AI Assistant
                        </div>
                    </div>
                </div>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
    <AIChatSidePanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onInsertCode={handleInsertCode}
        onRunCode={handleRunCode}
        activeFileName={activeFile?.name}
        activeFileContent={activeFile?.content}
        activeFileLanguage="TypeScript" // Assuming TypeScript as the language
        cursorPosition={cursorPosition}
        theme="dark"
        />
    </>
)

}

export default ToggleAI















