// components/playground/ai-chat-sidebar.tsx
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Trash2, Loader2, Code, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './chat-message';
import { useAiChat } from '@/hooks/use-ai-chat';

interface AiChatSidebarProps {
    playgroundId: string;
    editorContent: string;
    onInsertCode?: (code: string) => void;
    onRunCode?: () => void;
}

export default function AiChatSidebar({
    playgroundId,
    editorContent,
    onInsertCode,
    onRunCode
}: AiChatSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading,
        sendMessage,
        clearHistory,
        loadHistory
    } = useAiChat(playgroundId);

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load chat history on mount
    useEffect(() => {
        loadHistory();
    }, [playgroundId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sidebar resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 300 && newWidth <= 800) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue.trim();
        setInputValue('');

        // Gather context
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
        <>
            {/* Toggle Button (when collapsed) */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-l-lg shadow-lg transition-all z-50"
                    title="Open AI Assistant"
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
            )}

            {/* Sidebar Panel */}
            <div
                ref={sidebarRef}
                className={`fixed right-0 top-0 h-screen bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 z-40 flex flex-col ${isExpanded ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ width: `${sidebarWidth}px` }}
            >
                {/* Resize Handle */}
                <div
                    ref={resizeRef}
                    onMouseDown={() => setIsResizing(true)}
                    className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-purple-500 transition-colors"
                />

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">AI Coder Assistant</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Qwen3-Coder</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearHistory}
                            title="Clear chat history"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-lg mb-2">Welcome to AI Coder!</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                I can help you write code, debug errors, create files, and more.
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
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

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                    <div className="flex gap-2">
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about your code..."
                            className="flex-1 min-h-[80px] max-h-[200px] resize-none"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </div>

            {/* Overlay (when expanded on mobile) */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setIsExpanded(false)}
                />
            )}
        </>
    );
}
