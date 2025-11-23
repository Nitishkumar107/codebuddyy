// lib/ai-actions/file-operations.ts
"use client"

export interface FileNode {
    name: string;
    type: 'file' | 'folder';
    path: string;
    content?: string;
    children?: FileNode[];
}

export interface FileOperation {
    type: 'create' | 'update' | 'delete' | 'rename';
    path: string;
    content?: string;
    newPath?: string;
}

export class FileOperations {
    private fileSystem: Map<string, FileNode> = new Map();
    private onFileSystemChange?: () => void;

    constructor(onFileSystemChange?: () => void) {
        this.onFileSystemChange = onFileSystemChange;
    }

    /**
     * Create a new file
     */
    async createFile(path: string, content: string = ''): Promise<boolean> {
        try {
            // Confirm if file exists
            if (this.fileSystem.has(path)) {
                const overwrite = confirm(`File "${path}" already exists. Overwrite?`);
                if (!overwrite) return false;
            }

            const fileNode: FileNode = {
                name: path.split('/').pop() || path,
                type: 'file',
                path,
                content
            };

            this.fileSystem.set(path, fileNode);
            this.notifyChange();

            console.log(`[AI Coder] Created file: ${path}`);
            return true;
        } catch (error) {
            console.error('Error creating file:', error);
            return false;
        }
    }

    /**
     * Create a new folder
     */
    async createFolder(path: string): Promise<boolean> {
        try {
            if (this.fileSystem.has(path)) {
                console.warn(`Folder "${path}" already exists`);
                return false;
            }

            const folderNode: FileNode = {
                name: path.split('/').pop() || path,
                type: 'folder',
                path,
                children: []
            };

            this.fileSystem.set(path, folderNode);
            this.notifyChange();

            console.log(`[AI Coder] Created folder: ${path}`);
            return true;
        } catch (error) {
            console.error('Error creating folder:', error);
            return false;
        }
    }

    /**
     * Read file content
     */
    async readFile(path: string): Promise<string | null> {
        try {
            const node = this.fileSystem.get(path);
            if (!node || node.type !== 'file') {
                console.error(`File not found: ${path}`);
                return null;
            }
            return node.content || '';
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    }

    /**
     * Update file content
     */
    async updateFile(path: string, content: string): Promise<boolean> {
        try {
            const node = this.fileSystem.get(path);
            if (!node || node.type !== 'file') {
                console.error(`File not found: ${path}`);
                return false;
            }

            node.content = content;
            this.fileSystem.set(path, node);
            this.notifyChange();

            console.log(`[AI Coder] Updated file: ${path}`);
            return true;
        } catch (error) {
            console.error('Error updating file:', error);
            return false;
        }
    }

    /**
     * Delete file or folder
     */
    async deleteFile(path: string): Promise<boolean> {
        try {
            const node = this.fileSystem.get(path);
            if (!node) {
                console.error(`File/folder not found: ${path}`);
                return false;
            }

            // Confirm deletion
            const confirmed = confirm(
                `Are you sure you want to delete "${path}"?${node.type === 'folder' ? ' This will delete all contents.' : ''
                }`
            );

            if (!confirmed) return false;

            // Delete node and all children if folder
            if (node.type === 'folder') {
                const toDelete = Array.from(this.fileSystem.keys()).filter(key =>
                    key.startsWith(path + '/')
                );
                toDelete.forEach(key => this.fileSystem.delete(key));
            }

            this.fileSystem.delete(path);
            this.notifyChange();

            console.log(`[AI Coder] Deleted: ${path}`);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Rename file or folder
     */
    async renameFile(oldPath: string, newPath: string): Promise<boolean> {
        try {
            const node = this.fileSystem.get(oldPath);
            if (!node) {
                console.error(`File/folder not found: ${oldPath}`);
                return false;
            }

            if (this.fileSystem.has(newPath)) {
                console.error(`Target path already exists: ${newPath}`);
                return false;
            }

            // Update node
            node.path = newPath;
            node.name = newPath.split('/').pop() || newPath;

            // Move in map
            this.fileSystem.delete(oldPath);
            this.fileSystem.set(newPath, node);

            // Update children paths if folder
            if (node.type === 'folder') {
                const toUpdate = Array.from(this.fileSystem.entries()).filter(([key]) =>
                    key.startsWith(oldPath + '/')
                );

                toUpdate.forEach(([key, childNode]) => {
                    const newKey = key.replace(oldPath, newPath);
                    childNode.path = newKey;
                    this.fileSystem.delete(key);
                    this.fileSystem.set(newKey, childNode);
                });
            }

            this.notifyChange();

            console.log(`[AI Coder] Renamed: ${oldPath} -> ${newPath}`);
            return true;
        } catch (error) {
            console.error('Error renaming file:', error);
            return false;
        }
    }

    /**
     * List files in a directory
     */
    async listFiles(directory: string = ''): Promise<FileNode[]> {
        try {
            const files: FileNode[] = [];
            const prefix = directory ? directory + '/' : '';

            this.fileSystem.forEach((node, path) => {
                if (path.startsWith(prefix)) {
                    const relativePath = path.substring(prefix.length);
                    // Only include direct children
                    if (!relativePath.includes('/')) {
                        files.push(node);
                    }
                }
            });

            return files.sort((a, b) => {
                // Folders first
                if (a.type !== b.type) {
                    return a.type === 'folder' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
        } catch (error) {
            console.error('Error listing files:', error);
            return [];
        }
    }

    /**
     * Get file tree structure
     */
    getFileTree(): FileNode[] {
        return this.listFiles();
    }

    /**
     * Check if file exists
     */
    fileExists(path: string): boolean {
        return this.fileSystem.has(path);
    }

    /**
     * Get file count
     */
    getFileCount(): number {
        return Array.from(this.fileSystem.values()).filter(
            node => node.type === 'file'
        ).length;
    }

    /**
     * Clear all files (with confirmation)
     */
    async clearAll(): Promise<boolean> {
        const confirmed = confirm(
            'Are you sure you want to delete ALL files? This cannot be undone.'
        );

        if (!confirmed) return false;

        this.fileSystem.clear();
        this.notifyChange();

        console.log('[AI Coder] Cleared all files');
        return true;
    }

    /**
     * Notify file system change
     */
    private notifyChange() {
        if (this.onFileSystemChange) {
            this.onFileSystemChange();
        }
    }

    /**
     * Export file system to JSON
     */
    exportToJSON(): string {
        const files: Record<string, string> = {};
        this.fileSystem.forEach((node, path) => {
            if (node.type === 'file' && node.content) {
                files[path] = node.content;
            }
        });
        return JSON.stringify(files, null, 2);
    }

    /**
     * Import file system from JSON
     */
    async importFromJSON(json: string): Promise<boolean> {
        try {
            const files = JSON.parse(json);

            for (const [path, content] of Object.entries(files)) {
                if (typeof content === 'string') {
                    await this.createFile(path, content);
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing files:', error);
            return false;
        }
    }
}

// Singleton instance
export const fileOperations = new FileOperations();
