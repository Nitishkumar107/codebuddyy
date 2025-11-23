// lib/ai-service.ts
// Ollama AI Service for local code generation

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
    };
}

interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

interface ProjectStructure {
    projectName: string;
    description: string;
    techStack: string[];
    files: Array<{
        path: string;
        content: string;
    }>;
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts: Record<string, string>;
    setupInstructions?: string[];
}

export class OllamaService {
    private baseUrl: string;
    private model: string;

    constructor(baseUrl: string = 'http://localhost:11434', model: string = 'qwen3-coder:30b') {
        this.baseUrl = baseUrl;
        this.model = model;
    }

    /**
     * Generate a complete project from a natural language prompt
     */
    async generateProject(prompt: string): Promise<ProjectStructure> {
        const systemPrompt = this.buildSystemPrompt();
        const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nGenerate the complete project structure as JSON:`;

        const response = await this.generate(fullPrompt, false);

        try {
            console.log('Raw AI Response (first 500 chars):', response.substring(0, 500));

            // Try multiple JSON extraction strategies
            let jsonStr = '';

            // Strategy 1: Look for ```json code block
            const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonBlockMatch) {
                jsonStr = jsonBlockMatch[1];
                console.log('Found JSON in ```json block');
            }

            // Strategy 2: Look for any ``` code block
            if (!jsonStr) {
                const codeBlockMatch = response.match(/```\s*([\s\S]*?)\s*```/);
                if (codeBlockMatch) {
                    jsonStr = codeBlockMatch[1];
                    console.log('Found JSON in ``` block');
                }
            }

            // Strategy 3: Look for JSON object pattern
            if (!jsonStr) {
                const jsonObjectMatch = response.match(/\{[\s\S]*"projectName"[\s\S]*\}/);
                if (jsonObjectMatch) {
                    jsonStr = jsonObjectMatch[0];
                    console.log('Found JSON object pattern');
                }
            }

            // Strategy 4: Use entire response
            if (!jsonStr) {
                jsonStr = response;
                console.log('Using entire response as JSON');
            }

            // Clean the JSON string
            jsonStr = jsonStr.trim();

            console.log('Attempting to parse JSON (first 300 chars):', jsonStr.substring(0, 300));

            const project: ProjectStructure = JSON.parse(jsonStr);

            // Validate required fields
            if (!project.projectName || !project.files || !Array.isArray(project.files)) {
                throw new Error('Invalid project structure: missing required fields');
            }

            console.log('Successfully parsed project:', project.projectName);
            return project;
        } catch (error: any) {
            console.error('Failed to parse AI response:', error.message);
            console.error('Response length:', response.length);
            console.error('Response preview:', response.substring(0, 1000));
            throw new Error(`Failed to parse project structure: ${error.message}. The AI may need a clearer prompt or the response format is incorrect.`);
        }
    }

    /**
     * Generate text using Ollama API
     */
    async generate(prompt: string, stream: boolean = false): Promise<string> {
        const requestBody: OllamaGenerateRequest = {
            model: this.model,
            prompt,
            stream,
            options: {
                temperature: 0.7,
                top_p: 0.9,
            }
        };

        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data: OllamaGenerateResponse = await response.json();
        return data.response;
    }

    /**
     * Generate with streaming support
     */
    async *generateStream(prompt: string): AsyncGenerator<string> {
        const requestBody: OllamaGenerateRequest = {
            model: this.model,
            prompt,
            stream: true,
            options: {
                temperature: 0.7,
            }
        };

        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const data: OllamaGenerateResponse = JSON.parse(line);
                    if (data.response) {
                        yield data.response;
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
    }

    /**
     * Check if Ollama is running and accessible
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Build the system prompt for project generation
     */
    private buildSystemPrompt(): string {
        return `You are an expert full-stack developer and code architect. Your task is to generate complete, production-ready project structures based on user descriptions.

CRITICAL: You MUST respond with ONLY a valid JSON object. Do NOT include any explanations, markdown formatting, or text before or after the JSON.

The JSON must follow this EXACT structure:
{
  "projectName": "my-project-name",
  "description": "Brief description of the project",
  "techStack": ["React", "TypeScript", "Tailwind CSS"],
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\\n\\nfunction App() {\\n  return <div>Hello World</div>;\\n}\\n\\nexport default App;"
    }
  ],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "setupInstructions": [
    "Run npm install to install dependencies",
    "Run npm run dev to start the development server"
  ]
}

IMPORTANT RULES:
1. Start your response with { and end with }
2. Do NOT wrap the JSON in markdown code blocks
3. Do NOT add any text before or after the JSON
4. Ensure all strings are properly escaped
5. Keep file content concise but functional
6. Generate 3-10 files maximum for simplicity

Guidelines for code generation:
- Use TypeScript for JavaScript projects
- Include proper error handling
- Follow modern best practices
- Make code responsive (for web apps)
- Add helpful comments
- Use latest stable package versions

Remember: ONLY output the JSON object, nothing else!`;
    }
}

// Export singleton instance
export const ollamaService = new OllamaService();
