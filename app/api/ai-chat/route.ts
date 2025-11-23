// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/features/auth/action';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
    message: string;
    context: {
        editorContent: string;
        timestamp: string;
    };
    history: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

interface AIAction {
    type: 'insert_code' | 'create_file' | 'create_folder' | 'run_code' | 'explain';
    content: string;
    filename?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const user = await currentUser();
        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: ChatRequest = await request.json();
        const { message, context, history } = body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
        }

        // Build system prompt
        const systemPrompt = buildSystemPrompt();

        // Build conversation history
        const conversationHistory = history.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Build full prompt with context
        const fullPrompt = `${systemPrompt}

## CURRENT CONTEXT
Editor Content:
\`\`\`
${context.editorContent.substring(0, 2000)} ${context.editorContent.length > 2000 ? '...(truncated)' : ''}
\`\`\`

## CONVERSATION HISTORY
${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n')}

## USER MESSAGE
${message}

## YOUR RESPONSE
`;

        // Call Ollama
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen3-coder:30b',
                prompt: fullPrompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 1000
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        let aiResponse = data.response || '';

        // Parse for actions
        const action = parseAction(aiResponse);

        // Clean response (remove action JSON if present)
        aiResponse = cleanResponse(aiResponse);

        return NextResponse.json({
            response: aiResponse,
            action: action || undefined
        });

    } catch (error: any) {
        console.error('AI chat error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

function buildSystemPrompt(): string {
    return `You are AI Coder Assistant, an expert programming assistant integrated into a code playground environment.

## YOUR CAPABILITIES
- Write and explain code in any programming language
- Debug errors and suggest fixes
- Create and modify files and folders
- Provide code suggestions and best practices
- Help with testing and optimization

## CONTEXT PROVIDED
You will receive:
- Current code in the editor
- Conversation history
- User's specific question or request

## RESPONSE GUIDELINES
1. Be concise and helpful
2. Provide working, production-quality code
3. Explain complex concepts clearly
4. Use markdown formatting with code blocks
5. For code snippets, use proper syntax highlighting

## ACTION FORMAT
If you want to perform an action (insert code, create file, create folder, etc.), include a JSON block at the END of your response:

For creating a file:
\`\`\`json
{
  "action": "create_file",
  "content": "// file content here",
  "filename": "path/to/filename.ts"
}
\`\`\`

For creating a folder:
\`\`\`json
{
  "action": "create_folder",
  "content": "",
  "filename": "path/to/folder"
}
\`\`\`

For inserting code into current editor:
\`\`\`json
{
  "action": "insert_code",
  "content": "// code to insert",
  "filename": ""
}
\`\`\`

Available actions:
- "insert_code": Insert code into the editor
- "create_file": Create a new file
- "create_folder": Create a new folder
- "run_code": Run the code in playground
- "explain": Just explain (no action)

## IMPORTANT RULES
- Always provide working code
- Explain your reasoning
- Ask for clarification if needed
- Confirm destructive actions
- Be security-conscious (no eval, careful with user input)

Now respond to the user's message below.`;
}

function parseAction(response: string): AIAction | null {
    try {
        // Look for JSON action block
        const jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            const actionData = JSON.parse(jsonMatch[1]);
            if (actionData.action) {
                return {
                    type: actionData.action,
                    content: actionData.content || '',
                    filename: actionData.filename
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error parsing action:', error);
        return null;
    }
}

function cleanResponse(response: string): string {
    // Remove JSON action blocks
    return response.replace(/```json\s*\{[\s\S]*?\}\s*```/g, '').trim();
}
