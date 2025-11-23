// lib/ai-actions/code-operations.ts
"use client"

import { editor } from 'monaco-editor';

export interface CodeOperation {
    type: 'insert' | 'replace' | 'append' | 'prepend';
    content: string;
    position?: { line: number; column: number };
}

export class CodeOperations {
    private editorInstance: editor.IStandaloneCodeEditor | null = null;

    setEditor(editorInstance: editor.IStandaloneCodeEditor) {
        this.editorInstance = editorInstance;
    }

    /**
     * Insert code at cursor position
     */
    insertAtCursor(code: string): boolean {
        if (!this.editorInstance) {
            console.error('Editor instance not set');
            return false;
        }

        try {
            const selection = this.editorInstance.getSelection();
            if (!selection) return false;

            this.editorInstance.executeEdits('ai-coder', [{
                range: selection,
                text: code,
                forceMoveMarkers: true
            }]);

            // Move cursor to end of inserted code
            const lines = code.split('\n');
            const lastLine = lines[lines.length - 1];
            const newPosition = {
                lineNumber: selection.startLineNumber + lines.length - 1,
                column: lines.length === 1 ? selection.startColumn + lastLine.length : lastLine.length + 1
            };
            this.editorInstance.setPosition(newPosition);
            this.editorInstance.focus();

            return true;
        } catch (error) {
            console.error('Error inserting code:', error);
            return false;
        }
    }

    /**
     * Replace selected text with new code
     */
    replaceSelection(code: string): boolean {
        if (!this.editorInstance) {
            console.error('Editor instance not set');
            return false;
        }

        try {
            const selection = this.editorInstance.getSelection();
            if (!selection) return false;

            this.editorInstance.executeEdits('ai-coder', [{
                range: selection,
                text: code
            }]);

            this.editorInstance.focus();
            return true;
        } catch (error) {
            console.error('Error replacing selection:', error);
            return false;
        }
    }

    /**
     * Replace entire editor content
     */
    replaceAll(code: string): boolean {
        if (!this.editorInstance) {
            console.error('Editor instance not set');
            return false;
        }

        try {
            const model = this.editorInstance.getModel();
            if (!model) return false;

            const fullRange = model.getFullModelRange();
            this.editorInstance.executeEdits('ai-coder', [{
                range: fullRange,
                text: code
            }]);

            this.editorInstance.focus();
            return true;
        } catch (error) {
            console.error('Error replacing all content:', error);
            return false;
        }
    }

    /**
     * Append code at end of file
     */
    appendToEnd(code: string): boolean {
        if (!this.editorInstance) {
            console.error('Editor instance not set');
            return false;
        }

        try {
            const model = this.editorInstance.getModel();
            if (!model) return false;

            const lineCount = model.getLineCount();
            const lastLineLength = model.getLineLength(lineCount);

            this.editorInstance.executeEdits('ai-coder', [{
                range: {
                    startLineNumber: lineCount,
                    startColumn: lastLineLength + 1,
                    endLineNumber: lineCount,
                    endColumn: lastLineLength + 1
                },
                text: '\n' + code
            }]);

            this.editorInstance.focus();
            return true;
        } catch (error) {
            console.error('Error appending code:', error);
            return false;
        }
    }

    /**
     * Get current editor content
     */
    getContent(): string {
        if (!this.editorInstance) return '';
        return this.editorInstance.getValue();
    }

    /**
     * Get selected text
     */
    getSelection(): string {
        if (!this.editorInstance) return '';
        const selection = this.editorInstance.getSelection();
        if (!selection) return '';
        return this.editorInstance.getModel()?.getValueInRange(selection) || '';
    }

    /**
     * Get cursor position
     */
    getCursorPosition(): { line: number; column: number } | null {
        if (!this.editorInstance) return null;
        const position = this.editorInstance.getPosition();
        if (!position) return null;
        return {
            line: position.lineNumber,
            column: position.column
        };
    }

    /**
     * Format code
     */
    async formatCode(): Promise<boolean> {
        if (!this.editorInstance) return false;

        try {
            await this.editorInstance.getAction('editor.action.formatDocument')?.run();
            return true;
        } catch (error) {
            console.error('Error formatting code:', error);
            return false;
        }
    }
}

// Singleton instance
export const codeOperations = new CodeOperations();
