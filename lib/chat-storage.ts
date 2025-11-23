// lib/chat-storage.ts
"use client"

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

const DB_NAME = 'ai-chat-db';
const STORE_NAME = 'chatHistory';
const DB_VERSION = 1;

/**
 * Open IndexedDB connection
 */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('IndexedDB not available'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'playgroundId' });
            }
        };
    });
}

/**
 * Save chat history for a playground
 */
export async function saveChatHistory(playgroundId: string, messages: Message[]): Promise<void> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const data = {
            playgroundId,
            messages: messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
            })),
            lastUpdated: new Date().toISOString()
        };

        store.put(data);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                db.close();
                resolve();
            };
            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

/**
 * Load chat history for a playground
 */
export async function loadChatHistory(playgroundId: string): Promise<Message[]> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(playgroundId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close();
                const result = request.result;
                if (result && result.messages) {
                    // Convert timestamp strings back to Date objects
                    const messages = result.messages.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                    resolve(messages);
                } else {
                    resolve([]);
                }
            };
            request.onerror = () => {
                db.close();
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error loading chat history:', error);
        return [];
    }
}

/**
 * Clear chat history for a playground
 */
export async function clearChatHistory(playgroundId: string): Promise<void> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(playgroundId);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                db.close();
                resolve();
            };
            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    } catch (error) {
        console.error('Error clearing chat history:', error);
    }
}

/**
 * Get all chat histories
 */
export async function getAllChatHistories(): Promise<Array<{ playgroundId: string; lastUpdated: Date }>> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close();
                const results = request.result || [];
                const histories = results.map((record: any) => ({
                    playgroundId: record.playgroundId,
                    lastUpdated: new Date(record.lastUpdated)
                }));
                resolve(histories);
            };
            request.onerror = () => {
                db.close();
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error getting all chat histories:', error);
        return [];
    }
}
