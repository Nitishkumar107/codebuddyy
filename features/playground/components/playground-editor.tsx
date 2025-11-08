"use client"
import { useRef, useEffect, useCallback } from 'react' // Removed 'act' which is not needed here
import Editor, { type Monaco } from '@monaco-editor/react'
import { TemplateFile } from '@/features/playground/types'
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from '../lib/editor-config'

interface PlaygroundEditorProps {
    activeFile: TemplateFile | undefined;
    content: string;
    onContentChange: (value: string | undefined) => void;
}

const PlaygroundEditor = ({
    activeFile,
    content,
    onContentChange
}: PlaygroundEditorProps) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);

    const handleEditorDidMount = useCallback((editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        configureMonaco(monaco);
        updateEditorLanguage();
    }, []);

    const updateEditorLanguage = useCallback(() => {
        if (!activeFile || !monacoRef.current || !editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        const language = getEditorLanguage(activeFile.fileExtension || '');
        try {
            monacoRef.current.editor.setModelLanguage(model, language);
        } catch (error) {
            console.error("Error setting editor language:", error);
        }
    }, [activeFile]); // Added dependency array

    useEffect(() => { // Fixed: removed extra parentheses
        updateEditorLanguage();
    }, [updateEditorLanguage]); // Fixed: added dependency array with the function itself

    return <div className='h-full relative'>
        {/* TOdo ai thinking .. */}
        <Editor
            height="100%"
            width="100%"
            value={content}
            onChange={(value) => onContentChange(value || '')}
            onMount={handleEditorDidMount}
            language={activeFile? getEditorLanguage(activeFile.fileExtension || '') : 'plaintext'}
            options={defaultEditorOptions}
            >
        </Editor>


        </div>
};

export default PlaygroundEditor
