// D:\vscodedata\codebuddy\features\ai\components\hooks\useAISuggestion.tsx

import { currentUser } from "@/features/auth/action";
import { Columns } from "lucide-react";
import { editor, Position } from "monaco-editor";
import { useState, useCallback } from "react";
import { text } from "stream/consumers";
import { positive } from "zod";

interface AISuggestionState{
    suggestion: string | null;
    isLoading: boolean;
    position: {line:number; column: number} | null;
    decoration: string[];
    isEnabled: boolean;
}

interface UseAISuggestionsReturn extends AISuggestionState{
    toggleEnabled:()=> void;
    fetchSuggestion:(type:string, editor:any)=> Promise<void>;
    acceptSuggestion:(editor:any, monaco:any)=> void;
    rejectSuggestion:(editor:any)=>void;
    clearSuggestion:(editor:any)=>void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
    const [state, setState] = useState<AISuggestionState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true
    });
    const API_URL = 'http://localhost:3000/api/ai/suggestions';
    
    const toggleEnabled = useCallback(() => {
        setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
    }, []);

    // Define these functions at the hook level, not inside setState
    const acceptSuggestion = useCallback((editor: any, monaco: any) => {
    setState((currentState) => {
        if (
            !currentState.suggestion ||
            !currentState.position ||
            !editor ||
            !monaco
        ) {
            return currentState;
        }
        
        const { line, column } = currentState.position; // Fixed: using position properties
        const sanitizedSuggestion = currentState.suggestion.replace(/^\d+:\s*/gm, "");
        
        editor.executeEdits("", [{
            range: new monaco.Range(line, column, line, column), // Fixed: using column instead of Columns
            text: sanitizedSuggestion,
            forceMoveMarkers: true
        }]);
        
        if (editor && currentState.decoration.length > 0) {
            editor.deltaDecorations(currentState.decoration, []);
        }
        
        return {
            ...currentState,
            suggestion: null,
            position: null,
            decoration: []
        };
    });
}, []); // Empty dependency array - adjust as needed

    const rejectSuggestion = useCallback((editor: any) => {
    // Simply clear the suggestion without inserting it
    setState((currentState) => {
        if (editor && currentState.decoration.length > 0) {
            editor.deltaDecorations(currentState.decoration, []);
        }
        return {
            ...currentState,
            suggestion: null,
            position: null,
            decoration: [],
        };
    });
}, []); // Added dependency array

    const clearSuggestion = useCallback((editor: any) => {
        // Clear the suggestion and any decorations
        setState((currentState)=>{
            if (editor &&  currentState.decoration.length>0){
                editor.deltaDecoration(currentState.decoration, []);
            }
            return {
                ...currentState,
                suggestion: null,
                position: null,
                decoration: [],
            };
        })
    }, []);

const fetchSuggestion = useCallback(async (type: string, editor: any) => {
    if (!state.isEnabled) {
        console.warn("AI suggestions are disabled");
        return;
    }
    if (!editor) {
        console.warn("Editor instance is not available");
        return;
    }
    const model = editor.getModel();
    const cursorPosition = editor.getPosition();

    if (!model || !cursorPosition) {
        console.warn("Editor model or cursor position is not available.");
        return;
    }
    
    try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        const payload = {
            fileContent: model.getValue(),
            cursorLine: cursorPosition.lineNumber - 1,
            cursorColumn: cursorPosition.column - 1,
            suggestionType: type
        };
        
        // Debug: Check if environment variable exists
        console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
        
        // Use fallback URL for local development
        let apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:3001/api/ai/suggestions';
        
        if (process.env.NEXT_PUBLIC_API_URL) {
            apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/code-suggestion`;
        }
        
        console.log('Fetching from URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Response status:', response.status);
        console.log('Response URL:', response.url);
        
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data.suggestion) {
            const suggestionText = data.suggestion.trim();
            setState((prev) => ({
                ...prev,
                suggestion: suggestionText,
                position: {
                    line: cursorPosition.lineNumber,
                    column: cursorPosition.column
                },
                isLoading: false
            }));
        } else {
            console.warn("No suggestion received from API.");
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    } catch (error: any) {
        console.error("Error fetching code suggestion:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            url: error.url
        });
        setState((prev) => ({ ...prev, isLoading: false }));
    }
}, [state.isEnabled]);




    // Return all state and functions from the hook
    return {
        ...state,
        toggleEnabled,
        fetchSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        clearSuggestion
    };
};
