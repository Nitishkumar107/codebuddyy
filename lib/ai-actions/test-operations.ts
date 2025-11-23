// lib/ai-actions/test-operations.ts
"use client"

export interface TestResult {
    success: boolean;
    output: string;
    errors: string[];
    duration: number;
}

export interface IterativeFixResult {
    success: boolean;
    attempts: number;
    finalCode: string;
    history: Array<{
        attempt: number;
        error: string;
        fix: string;
    }>;
}

export class TestOperations {
    private consoleOutput: string[] = [];
    private consoleErrors: string[] = [];
    private maxIterations: number = 3;

    /**
     * Run code in sandboxed environment
     */
    async runCode(code: string, language: string = 'javascript'): Promise<TestResult> {
        const startTime = Date.now();
        this.clearConsole();

        try {
            if (language === 'javascript' || language === 'typescript') {
                return await this.runJavaScript(code);
            } else if (language === 'html') {
                return await this.runHTML(code);
            } else {
                throw new Error(`Unsupported language: ${language}`);
            }
        } catch (error: any) {
            return {
                success: false,
                output: this.consoleOutput.join('\n'),
                errors: [error.message, ...this.consoleErrors],
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Run JavaScript code in isolated context
     */
    private async runJavaScript(code: string): Promise<TestResult> {
        const startTime = Date.now();

        return new Promise((resolve) => {
            try {
                // Create sandboxed iframe
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.sandbox.add('allow-scripts');
                document.body.appendChild(iframe);

                const iframeWindow = iframe.contentWindow;
                if (!iframeWindow) {
                    throw new Error('Failed to create sandbox');
                }

                // Override console methods
                iframeWindow.console = {
                    log: (...args: any[]) => {
                        this.consoleOutput.push(args.map(String).join(' '));
                    },
                    error: (...args: any[]) => {
                        this.consoleErrors.push(args.map(String).join(' '));
                    },
                    warn: (...args: any[]) => {
                        this.consoleOutput.push('[WARN] ' + args.map(String).join(' '));
                    },
                    info: (...args: any[]) => {
                        this.consoleOutput.push('[INFO] ' + args.map(String).join(' '));
                    }
                } as any;

                // Execute code
                try {
                    iframeWindow.eval(code);

                    // Clean up
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 100);

                    resolve({
                        success: this.consoleErrors.length === 0,
                        output: this.consoleOutput.join('\n'),
                        errors: this.consoleErrors,
                        duration: Date.now() - startTime
                    });
                } catch (execError: any) {
                    document.body.removeChild(iframe);

                    resolve({
                        success: false,
                        output: this.consoleOutput.join('\n'),
                        errors: [execError.message, ...this.consoleErrors],
                        duration: Date.now() - startTime
                    });
                }
            } catch (error: any) {
                resolve({
                    success: false,
                    output: this.consoleOutput.join('\n'),
                    errors: [error.message, ...this.consoleErrors],
                    duration: Date.now() - startTime
                });
            }
        });
    }

    /**
     * Run HTML code in iframe
     */
    private async runHTML(code: string): Promise<TestResult> {
        const startTime = Date.now();

        return new Promise((resolve) => {
            try {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.sandbox.add('allow-scripts');
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentDocument;
                if (!iframeDoc) {
                    throw new Error('Failed to create sandbox');
                }

                // Write HTML
                iframeDoc.open();
                iframeDoc.write(code);
                iframeDoc.close();

                // Wait for load
                iframe.onload = () => {
                    setTimeout(() => {
                        document.body.removeChild(iframe);

                        resolve({
                            success: true,
                            output: 'HTML rendered successfully',
                            errors: [],
                            duration: Date.now() - startTime
                        });
                    }, 100);
                };

                iframe.onerror = (error) => {
                    document.body.removeChild(iframe);

                    resolve({
                        success: false,
                        output: '',
                        errors: [String(error)],
                        duration: Date.now() - startTime
                    });
                };
            } catch (error: any) {
                resolve({
                    success: false,
                    output: '',
                    errors: [error.message],
                    duration: Date.now() - startTime
                });
            }
        });
    }

    /**
     * Iterative fix loop - run code, analyze errors, fix, repeat
     */
    async iterativeFix(
        initialCode: string,
        language: string,
        onProgress?: (attempt: number, error: string) => void
    ): Promise<IterativeFixResult> {
        let currentCode = initialCode;
        const history: Array<{ attempt: number; error: string; fix: string }> = [];

        for (let attempt = 1; attempt <= this.maxIterations; attempt++) {
            // Run code
            const result = await this.runCode(currentCode, language);

            if (result.success) {
                return {
                    success: true,
                    attempts: attempt,
                    finalCode: currentCode,
                    history
                };
            }

            // Get error
            const error = result.errors[0] || 'Unknown error';

            if (onProgress) {
                onProgress(attempt, error);
            }

            // If last attempt, return failure
            if (attempt === this.maxIterations) {
                return {
                    success: false,
                    attempts: attempt,
                    finalCode: currentCode,
                    history
                };
            }

            // Ask AI for fix
            const fix = await this.requestFix(currentCode, error, result.output);

            history.push({
                attempt,
                error,
                fix
            });

            currentCode = fix;
        }

        return {
            success: false,
            attempts: this.maxIterations,
            finalCode: currentCode,
            history
        };
    }

    /**
     * Request AI to fix code based on error
     */
    private async requestFix(code: string, error: string, output: string): Promise<string> {
        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Fix this error:\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nError: ${error}\n\nOutput: ${output}\n\nProvide only the fixed code, no explanations.`,
                    context: {
                        editorContent: code,
                        timestamp: new Date().toISOString()
                    },
                    history: []
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI fix');
            }

            const data = await response.json();

            // Extract code from response
            const codeMatch = data.response.match(/```[\w]*\n([\s\S]*?)\n```/);
            return codeMatch ? codeMatch[1] : data.response;
        } catch (error) {
            console.error('Error requesting fix:', error);
            return code; // Return original code if fix fails
        }
    }

    /**
     * Capture console output
     */
    getConsoleOutput(): string {
        return this.consoleOutput.join('\n');
    }

    /**
     * Get console errors
     */
    getConsoleErrors(): string[] {
        return [...this.consoleErrors];
    }

    /**
     * Clear console
     */
    clearConsole(): void {
        this.consoleOutput = [];
        this.consoleErrors = [];
    }

    /**
     * Set max iterations for iterative fix
     */
    setMaxIterations(max: number): void {
        this.maxIterations = Math.max(1, Math.min(10, max));
    }
}

// Singleton instance
export const testOperations = new TestOperations();
