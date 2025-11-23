// lib/keyboard-shortcuts.ts
"use client"

export type ShortcutHandler = () => void;

export interface Shortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    handler: ShortcutHandler;
    description: string;
}

export class KeyboardShortcuts {
    private shortcuts: Map<string, Shortcut> = new Map();
    private isEnabled: boolean = true;

    constructor() {
        this.setupEventListener();
    }

    /**
     * Register a keyboard shortcut
     */
    register(shortcut: Shortcut): void {
        const key = this.getShortcutKey(shortcut);
        this.shortcuts.set(key, shortcut);
        console.log(`[Shortcuts] Registered: ${key} - ${shortcut.description}`);
    }

    /**
     * Unregister a keyboard shortcut
     */
    unregister(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean): void {
        const shortcutKey = this.buildKey(key, ctrl, shift, alt);
        this.shortcuts.delete(shortcutKey);
    }

    /**
     * Enable shortcuts
     */
    enable(): void {
        this.isEnabled = true;
    }

    /**
     * Disable shortcuts
     */
    disable(): void {
        this.isEnabled = false;
    }

    /**
     * Get all registered shortcuts
     */
    getAll(): Shortcut[] {
        return Array.from(this.shortcuts.values());
    }

    /**
     * Setup global event listener
     */
    private setupEventListener(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!this.isEnabled) return;

            // Don't trigger if user is typing in input/textarea
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                // Allow Ctrl+Shift+A even in inputs
                if (!(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
                    return;
                }
            }

            const key = this.buildKey(
                e.key.toLowerCase(),
                e.ctrlKey,
                e.shiftKey,
                e.altKey
            );

            const shortcut = this.shortcuts.get(key);
            if (shortcut) {
                e.preventDefault();
                e.stopPropagation();
                shortcut.handler();
            }
        });
    }

    /**
     * Build shortcut key string
     */
    private buildKey(
        key: string,
        ctrl?: boolean,
        shift?: boolean,
        alt?: boolean
    ): string {
        const parts: string[] = [];
        if (ctrl) parts.push('ctrl');
        if (shift) parts.push('shift');
        if (alt) parts.push('alt');
        parts.push(key.toLowerCase());
        return parts.join('+');
    }

    /**
     * Get shortcut key from shortcut object
     */
    private getShortcutKey(shortcut: Shortcut): string {
        return this.buildKey(
            shortcut.key,
            shortcut.ctrl,
            shortcut.shift,
            shortcut.alt
        );
    }

    /**
     * Format shortcut for display
     */
    static formatShortcut(shortcut: Shortcut): string {
        const parts: string[] = [];
        if (shortcut.ctrl) parts.push('Ctrl');
        if (shortcut.shift) parts.push('Shift');
        if (shortcut.alt) parts.push('Alt');
        parts.push(shortcut.key.toUpperCase());
        return parts.join('+');
    }
}

// Singleton instance
export const keyboardShortcuts = new KeyboardShortcuts();

// Default shortcuts
export function registerDefaultShortcuts(handlers: {
    toggleSidebar?: () => void;
    clearChat?: () => void;
    focusInput?: () => void;
    formatCode?: () => void;
    runCode?: () => void;
}) {
    if (handlers.toggleSidebar) {
        keyboardShortcuts.register({
            key: 'a',
            ctrl: true,
            shift: true,
            handler: handlers.toggleSidebar,
            description: 'Toggle AI Chat Sidebar'
        });
    }

    if (handlers.clearChat) {
        keyboardShortcuts.register({
            key: 'k',
            ctrl: true,
            shift: true,
            handler: handlers.clearChat,
            description: 'Clear Chat History'
        });
    }

    if (handlers.focusInput) {
        keyboardShortcuts.register({
            key: 'i',
            ctrl: true,
            shift: true,
            handler: handlers.focusInput,
            description: 'Focus Chat Input'
        });
    }

    if (handlers.formatCode) {
        keyboardShortcuts.register({
            key: 'f',
            ctrl: true,
            shift: true,
            alt: true,
            handler: handlers.formatCode,
            description: 'Format Code'
        });
    }

    if (handlers.runCode) {
        keyboardShortcuts.register({
            key: 'enter',
            ctrl: true,
            shift: true,
            handler: handlers.runCode,
            description: 'Run Code'
        });
    }
}
