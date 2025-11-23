# AI Coder - User Guide

## 🚀 Quick Start

The AI Coder is now integrated into your CodeBuddy playground! Here's how to use it:

### Accessing AI Coder

1. Open any playground
2. Look for the **tabs at the bottom** of the preview area
3. Click the **"AI Coder"** tab (next to Terminal)
4. You'll see a purple sparkle icon ✨

### Using AI Coder

#### 1. Ask Questions
Type your question in the input box at the bottom:
- "How do I create a React component?"
- "Explain this code"
- "What's wrong with my function?"
- "How can I improve this?"

#### 2. Get Code Suggestions
Ask the AI to generate code:
- "Create a button component in React"
- "Write a function to sort an array"
- "Generate a login form"
- "Create a REST API endpoint"

#### 3. Copy the Code
- AI responses include syntax-highlighted code blocks
- Click the **copy button** on any code block
- Or select text and press **Ctrl+C**

#### 4. Use the Code
- Manually create a new file in your playground
- Paste the code from AI
- Save and test!

## 💡 Tips for Best Results

### Be Specific
❌ "Create a component"
✅ "Create a React functional component called Button with props for text and onClick"

### Provide Context
Include relevant code or describe your current setup:
- "I'm using React 18 with TypeScript"
- "Here's my current code: [paste code]"
- "I'm getting this error: [paste error]"

### Ask Follow-up Questions
The AI remembers your conversation:
- "Can you add error handling to that?"
- "Make it responsive"
- "Add TypeScript types"

## 🎯 Common Use Cases

### 1. Code Generation
```
You: "Create a React component for a card with title and description"
AI: [Provides complete component code]
You: [Copy code → Create file → Paste → Save]
```

### 2. Debugging Help
```
You: "Why is this function not working? [paste code]"
AI: [Explains the issue and provides fix]
You: [Copy fix → Update file → Save]
```

### 3. Code Explanation
```
You: "Explain what this code does: [paste code]"
AI: [Provides detailed explanation]
```

### 4. Best Practices
```
You: "How can I improve this code? [paste code]"
AI: [Suggests improvements with examples]
```

## ⌨️ Keyboard Shortcuts

- **Enter** - Send message
- **Shift+Enter** - New line in input
- **Ctrl+C** - Copy selected text

## 🎨 Features

✅ **Markdown Support** - Formatted responses with headers, lists, etc.
✅ **Syntax Highlighting** - Code blocks with proper language highlighting
✅ **Copy Buttons** - One-click copy for code blocks
✅ **Chat History** - Conversations persist across sessions
✅ **Context Aware** - AI knows about your current code
✅ **Text Selection** - Select and copy any part of responses
✅ **Resizable** - Drag the divider to resize terminal/AI area

## 🔧 Settings

### Clear Chat History
Click the **trash icon** 🗑️ next to the send button to clear all messages

### Switch Between Terminal and AI
Click the tabs to switch:
- **Terminal** - For running commands
- **AI Coder** - For AI assistance

## 📝 Example Conversations

### Example 1: Creating a Component
```
You: Create a React component for a user profile card

AI: Here's a React component for a user profile card:

[Code block with component]

You can customize the styling and add more fields as needed.

You: Add a button to edit the profile

AI: Here's the updated component with an edit button:

[Updated code block]
```

### Example 2: Debugging
```
You: I'm getting "Cannot read property 'map' of undefined"

AI: This error occurs when you're trying to use .map() on a variable 
that is undefined. Here are common solutions:

1. Add a check: {data && data.map(...)}
2. Use optional chaining: {data?.map(...)}
3. Provide a default: {(data || []).map(...)}

[Example code]
```

### Example 3: Learning
```
You: What's the difference between useState and useRef?

AI: [Detailed explanation with examples]

You: Show me an example of when to use useRef

AI: [Practical example with code]
```

## 🚀 Powered By

- **Ollama** - Local AI model (qwen3-coder:30b)
- **React** - UI framework
- **Monaco Editor** - Code editor
- **WebContainer** - In-browser Node.js runtime

## 💬 Need Help?

If the AI doesn't understand your question:
1. Rephrase it more specifically
2. Provide more context
3. Break complex questions into smaller parts
4. Include relevant code snippets

---

**Enjoy coding with AI assistance! 🎉**
