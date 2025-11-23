// hooks/use-ai-chat.ts
"use client"

import { useState, useCallback } from 'react';
import { saveChatHistory, loadChatHistory, clearChatHistory } from '@/lib/chat-storage';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    action?: {
        type: 'insert_code' | 'create_file' | 'run_code';
        content: string;
        filename?: string;
    };
}

interface ChatContext {
    editorContent: string;
    timestamp: string;
}

export function useAiChat(playgroundId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        const history = await loadChatHistory(playgroundId);
        setMessages(history);
    }, [playgroundId]);

    const sendMessage = useCallback(async (content: string, context: ChatContext) => {
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Send to API
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: content,
                    context,
                    history: messages.slice(-10) // Last 10 messages for context
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();

            // Add AI response
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                action: data.action
            };

            setMessages(prev => {
                const updated = [...prev, aiMessage];
                // Save to storage
                saveChatHistory(playgroundId, updated);
                return updated;
            });
        } catch (error) {
            console.error('AI chat error:', error);

            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure Ollama is running and try again.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, playgroundId]);

    const clearHistory = useCallback(async () => {
        setMessages([]);
        await clearChatHistory(playgroundId);
    }, [playgroundId]);

    return {
        messages,
        isLoading,
        sendMessage,
        clearHistory,
        loadHistory
    };
}
