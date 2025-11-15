'use client';

import { useEffect, useState } from 'react';

export function useMonacoEditor() {
    const [monaco, setMonaco] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
        
        const loadMonaco = async () => {
        try {
            setLoading(true);
            // Dynamically import monaco-editor
            const monacoModule = await import('monaco-editor');
            setMonaco(monacoModule);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load monaco editor:', err);
            setError('Failed to load code editor');
            setLoading(false);
        }
        };

        loadMonaco();
    }, []);

    return { monaco, isClient, loading, error };
}
