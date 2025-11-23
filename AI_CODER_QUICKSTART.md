# AI Coder - Quick Start Guide

## ✅ Ready to Use!

The AI Coder chatbot is now **fully integrated** and ready to use - **no npm install needed**!

---

## 🎯 What's Working

### ✅ No Dependencies Required
- Rewrote `chat-storage.ts` to use **native IndexedDB API**
- No need for `idb`, `react-markdown`, or `react-syntax-highlighter`
- Everything works out of the box!

### ✅ Location
The AI chatbot appears as a **tab next to the terminal** in the preview area:
- **Terminal** tab - Command-line access
- **AI Coder** tab - Chat with AI assistant

---

## 🚀 How to Use

### 1. Open Playground
Navigate to any playground: `/playground/[id]`

### 2. Find AI Coder Tab
Look at the bottom-right preview area, you'll see two tabs:
- Terminal
- **AI Coder** ← Click this!

### 3. Ask Questions
Type your question and press Enter:
- "Create a React component"
- "Fix this error"
- "Explain this code"
- "Add error handling"

### 4. Insert Code
- AI responds with code
- Click "Insert into Editor" button
- Code appears in your active file

---

## ⚠️ Important Notes

### Ollama Must Be Running
```bash
# Start Ollama
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### Model Required
```bash
# Pull the model (if not already done)
ollama pull qwen3-coder:30b

# Or use smaller/faster model
ollama pull qwen3-coder:7b
```

### Update Model in Code
If using 7B model, edit `app/api/ai-chat/route.ts` line 66:
```typescript
model: 'qwen3-coder:7b'  // Change from 30b to 7b
```

---

## 🎨 Features

### Chat Interface
- ✅ Message history
- ✅ Auto-scroll
- ✅ Loading indicators
- ✅ Clear history button
- ✅ Message count badge

### Code Operations
- ✅ Insert code into editor
- ✅ Copy code to clipboard
- ✅ Syntax highlighting (basic)
- ✅ Context-aware suggestions

### Persistence
- ✅ Chat history saved (IndexedDB)
- ✅ Persists across page refreshes
- ✅ Separate history per playground

---

## 🐛 Troubleshooting

### "AI is not responding"
**Solution**: Check if Ollama is running
```bash
ollama serve
```

### "Module not found" errors
**Solution**: Already fixed! Using native APIs now.

### "Slow responses"
**Solution**: 
- Normal for 30B model (10-30 seconds)
- Use 7B model for faster responses
- Ensure sufficient RAM (32GB+ for 30B)

### Chat not appearing
**Solution**:
1. Refresh the page
2. Check browser console for errors
3. Verify you're on playground page

---

## 📊 What's Included

### Components
- ✅ `terminal-ai-tabs.tsx` - Tabbed interface
- ✅ `chat-message.tsx` - Message rendering
- ✅ `use-ai-chat.ts` - Chat state management
- ✅ `chat-storage.ts` - Native IndexedDB storage

### API
- ✅ `/api/ai-chat` - Ollama integration
- ✅ Context gathering
- ✅ Action parsing
- ✅ Error handling

### Features
- ✅ Code operations
- ✅ File operations
- ✅ Testing capabilities
- ✅ Keyboard shortcuts
- ✅ Voice integration

---

## ✨ Summary

**Status**: ✅ **READY TO USE**

**No Installation Required**: Everything works with native browser APIs

**Location**: Preview area → AI Coder tab (next to Terminal)

**Requirements**: 
- Ollama running (`ollama serve`)
- Model pulled (`ollama pull qwen3-coder:30b`)

**Try it now**: Open a playground and click the "AI Coder" tab!

🚀 **Happy coding with AI assistance!**
