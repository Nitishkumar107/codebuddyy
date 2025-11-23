// components/playground/terminal-ai-tabs.tsx
"use client"

import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, MessageSquare, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAiChat } from '@/hooks/use-ai-chat';
import ChatMessage from './chat-message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Trash2 } from 'lucide-react';

const TerminalComponent = dynamic(
    () => import('@/features/webContainers/components/terminal'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading terminal...</p>
                </div>
            </div>
        )
    }
);

interface TerminalAiTabsProps {
    playgroundId: string;
    editorContent: string;
    webContainerInstance: any;
    onInsertCode?: (code: string) => void;
    onRunCode?: () => void;
    onCreateFile?: (filename: string, content: string) => Promise<void>;
    onCreateFolder?: (folderName: string) => Promise<void>;
}

export default function TerminalAiTabs({
    playgroundId,
    editorContent,
    webContainerInstance,
    onInsertCode,
    onRunCode,
    onCreateFile,
    onCreateFolder
}: TerminalAiTabsProps) {
    const [activeTab, setActiveTab] = useState('terminal');
    const terminalRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');

    const {
        messages,
        isLoading,
        sendMessage,
        clearHistory,
        loadHistory
    } = useAiChat(playgroundId);

    // Load chat history on mount
    React.useEffect(() => {
        loadHistory();
    }, [playgroundId]);

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
        if (activeTab === 'ai-chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue.trim();
        setInputValue('');

        const context = {
            editorContent,
            timestamp: new Date().toISOString()
        };

        await sendMessage(message, context);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearHistory = () => {
        if (confirm('Are you sure you want to clear the chat history?')) {
            clearHistory();
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col !select-text cursor-text">
            <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 h-10 flex-shrink-0">
                <TabsTrigger value="terminal" className="gap-2">
                    <Terminal className="w-4 h-4" />
                    Terminal
                </TabsTrigger>
                <TabsTrigger value="ai-chat" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Coder
                    {messages.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-500 text-white rounded-full">
                            {messages.length}
                        </span>
                    )}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="terminal" className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                <TerminalComponent
                    ref={terminalRef}
                    webContainerInstance={webContainerInstance}
                    theme="dark"
                    className="h-full"
                />
            </TabsContent>

            <TabsContent value="ai-chat" className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                {/* Chat Messages */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h4 className="font-semibold text-lg mb-2">AI Coder Assistant</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Ask me anything about your code!
                                </p>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>Try asking:</p>
                                    <ul className="list-disc list-inside text-left">
                                        <li>"Create a React component"</li>
                                        <li>"Fix this error"</li>
                                        <li>"Explain this code"</li>
                                        <li>"Add error handling"</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        onInsertCode={onInsertCode}
                                        onRunCode={onRunCode}
                                        onCreateFile={onCreateFile}
                                        onCreateFolder={onCreateFolder}
                                    />
                                ))}
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>AI is thinking...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Input Area - Always visible */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-zinc-800 bg-background">
                    <div className="flex items-end gap-2">
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask AI Coder anything..."
                            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                            disabled={isLoading}
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                                size="sm"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                            {messages.length > 0 && (
                                <Button
                                    onClick={handleClearHistory}
                                    variant="outline"
                                    size="sm"
                                    title="Clear history"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </TabsContent>
        </Tabs>
    );
}
