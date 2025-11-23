# AI Coder - File/Folder Creation Implementation Guide

## ✅ What's Already Working

1. **Text Wrapping** - AI responses wrap properly (added `break-words` class)
2. **Text Selection** - You can select and copy text with Ctrl+C
3. **Chat Interface** - Fully functional with history persistence
4. **Ollama Integration** - AI responds to questions

## 🔧 What Needs to Be Added

To enable the AI to actually create files and folders, we need to wire up callbacks through the component chain.

### Step 1: Update `app/playground/[id]/page.tsx`

Find the `<WebContainerPreview` component (around line 515) and add these props:

```tsx
<WebContainerPreview
  templateData={templateData}
  instance={instance}
  writeFileSync={writeFileSync}
  isLoading={containerLoading}
  error={containerError}
  serverUrl={serverUrl!}
  forceResetup={false}
  // ADD THESE NEW PROPS:
  playgroundId={id}
  editorContent={editorContent}
  onInsertCode={(code) => {
    if (activeFileId) {
      updateFileContent(activeFileId, code);
    }
  }}
  onRunCode={() => {
    console.log('Run code triggered from AI');
  }}
  onCreateFile={async (filename: string, content: string) => {
    const newFile: TemplateFile = {
      id: Date.now().toString(),
      filename: filename.includes('.') ? filename.split('.')[0] : filename,
      fileExtension: filename.includes('.') ? filename.split('.').pop()! : 'txt',
      content: content,
      hasUnsavedChanges: false,
      originalContent: content
    };
    await wrappedHandleAddFile(newFile, '');
  }}
  onCreateFolder={async (folderName: string) => {
    const newFolder: TemplateFolder = {
      id: Date.now().toString(),
      folderName: folderName,
      items: []
    };
    await wrappedHandleAddFolder(newFolder, '');
  }}
/>
```

### Step 2: Update `features/webContainers/components/webcontainer-preview.tsx`

Add the new props to the interface and pass them to `TerminalAiTabs`:

```tsx
// Add to interface (around line 32):
interface WebContainerPreviewProps {
  // ... existing props ...
  playgroundId?: string;
  editorContent?: string;
  onInsertCode?: (code: string) => void;
  onRunCode?: () => void;
  onCreateFile?: (filename: string, content: string) => Promise<void>;
  onCreateFolder?: (folderName: string) => Promise<void>;
}

// Add to function parameters (around line 45):
const WebContainerPreview = ({
  // ... existing params ...
  playgroundId = '',
  editorContent = '',
  onInsertCode,
  onRunCode,
  onCreateFile,
  onCreateFolder
}: WebContainerPreviewProps) => {

// Pass to TerminalAiTabs (around line 350):
<TerminalAiTabs
  playgroundId={playgroundId}
  editorContent={editorContent}
  webContainerInstance={instance}
  onInsertCode={onInsertCode}
  onRunCode={onRunCode}
  onCreateFile={onCreateFile}
  onCreateFolder={onCreateFolder}
/>
```

### Step 3: Update `components/playground/terminal-ai-tabs.tsx`

Add the props to the interface and pass them to `ChatMessage`:

```tsx
// Add to interface (around line 30):
interface TerminalAiTabsProps {
  // ... existing props ...
  onCreateFile?: (filename: string, content: string) => Promise<void>;
  onCreateFolder?: (folderName: string) => Promise<void>;
}

// Add to function parameters (around line 38):
export default function TerminalAiTabs({
  // ... existing params ...
  onCreateFile,
  onCreateFolder
}: TerminalAiTabsProps) {

// Pass to ChatMessage (around line 178):
<ChatMessage
  key={message.id}
  message={message}
  onInsertCode={onInsertCode}
  onRunCode={onRunCode}
  onCreateFile={onCreateFile}
  onCreateFolder={onCreateFolder}
/>
```

### Step 4: Update `components/playground/chat-message.tsx`

The props are already added! Just need to use them when AI returns file creation actions.

### Step 5: Update AI API to Return File Operations

In `app/api/ai-chat/route.ts`, update the system prompt to tell the AI it can create files:

```typescript
const systemPrompt = `You are an AI coding assistant integrated into a code playground.

You can perform these actions:
1. **insert_code**: Insert code into the current file
2. **create_file**: Create a new file with content
3. **create_folder**: Create a new folder
4. **run_code**: Run the code

When creating files, respond with JSON:
{
  "action": "create_file",
  "filename": "example.js",
  "content": "console.log('Hello');"
}

When creating folders:
{
  "action": "create_folder",
  "folderName": "components"
}
`;
```

## 🎯 Result

Once implemented, the AI will be able to:
- ✅ Create new files with code
- ✅ Create folders
- ✅ Insert code into existing files
- ✅ Organize the project structure

## ⚠️ Note

I've had trouble editing these files without corrupting them. You may want to manually make these changes by copying the code snippets above.

The key is to pass the callbacks through:
`playground page` → `WebContainerPreview` → `TerminalAiTabs` → `ChatMessage`
