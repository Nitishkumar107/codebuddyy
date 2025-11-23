// components/playground/chat-message.tsx
"use client"

import React from 'react';
import { User, Bot, Copy, Check, Code, Play, FilePlus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    action?: {
        type: 'insert_code' | 'create_file' | 'create_folder' | 'run_code';
        content: string;
        filename?: string;
    };
}

interface ChatMessageProps {
    message: Message;
    onInsertCode?: (code: string) => void;
    onRunCode?: () => void;
    onCreateFile?: (filename: string, content: string) => Promise<void>;
    onCreateFolder?: (folderName: string) => Promise<void>;
}

export default function ChatMessage({
    message,
    onInsertCode,
    onRunCode,
    onCreateFile,
    onCreateFolder
}: ChatMessageProps) {
    const [copied, setCopied] = React.useState(false);
    const [isActionLoading, setIsActionLoading] = React.useState(false);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateFile = async () => {
        if (!onCreateFile || !message.action?.filename) return;

        try {
            setIsActionLoading(true);
            await onCreateFile(message.action.filename, message.action.content);
            toast.success(`Created file: ${message.action.filename}`);
        } catch (error) {
            console.error('Failed to create file:', error);
            toast.error('Failed to create file');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!onCreateFolder || !message.action?.filename) return;

        try {
            setIsActionLoading(true);
            await onCreateFolder(message.action.filename);
            toast.success(`Created folder: ${message.action.filename}`);
        } catch (error) {
            console.error('Failed to create folder:', error);
            toast.error('Failed to create folder');
        } finally {
            setIsActionLoading(false);
        }
    };

    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}
            >
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                    className={`rounded-lg p-3 max-w-[85%] !select-text cursor-text ${isUser
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100'
                        }`}
                    style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                >
                    {isUser ? (
                        <p className="text-sm whitespace-pre-wrap break-words select-text">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown
                                components={{
                                    code(props: any) {
                                        const { node, inline, className, children, ...rest } = props;
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeString = String(children).replace(/\n$/, '');

                                        return !inline && match ? (
                                            <div className="relative group">
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus as any}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    className="rounded-md text-xs"
                                                    customStyle={{
                                                        userSelect: 'text',
                                                        WebkitUserSelect: 'text',
                                                        cursor: 'text'
                                                    }}
                                                    {...rest}
                                                >
                                                    {codeString}
                                                </SyntaxHighlighter>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleCopy(codeString)}
                                                        className="h-7 px-2"
                                                    >
                                                        {copied ? (
                                                            <Check className="w-3 h-3" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </Button>
                                                    {onInsertCode && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => onInsertCode(codeString)}
                                                            className="h-7 px-2"
                                                            title="Insert into editor"
                                                        >
                                                            <Code className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <code className={className} {...rest}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {message.action && !isUser && (
                    <div className="mt-2 flex gap-2">
                        {message.action.type === 'insert_code' && onInsertCode && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onInsertCode(message.action!.content)}
                                className="text-xs"
                            >
                                <Code className="w-3 h-3 mr-1" />
                                Insert into Editor
                            </Button>
                        )}
                        {message.action.type === 'run_code' && onRunCode && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onRunCode}
                                className="text-xs"
                            >
                                <Play className="w-3 h-3 mr-1" />
                                Run in Playground
                            </Button>
                        )}
                        {message.action.type === 'create_file' && onCreateFile && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCreateFile}
                                disabled={isActionLoading}
                                className="text-xs"
                            >
                                <FilePlus className="w-3 h-3 mr-1" />
                                {isActionLoading ? 'Creating...' : `Create File: ${message.action.filename}`}
                            </Button>
                        )}
                        {message.action.type === 'create_folder' && onCreateFolder && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCreateFolder}
                                disabled={isActionLoading}
                                className="text-xs"
                            >
                                <FolderPlus className="w-3 h-3 mr-1" />
                                {isActionLoading ? 'Creating...' : `Create Folder: ${message.action.filename}`}
                            </Button>
                        )}
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
}
