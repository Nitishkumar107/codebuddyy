// D:\vscodedata\codebuddy\features\webContainers\utils/webContainerManager.ts

import { WebContainer } from '@webcontainer/api';

class WebContainerManager {
    private static instance: WebContainer | null = null;
    private static isInitializing = false;
    private static initializationPromise: Promise<WebContainer> | null = null;

    static async getInstance(): Promise<WebContainer> {
        if (this.instance) {
        return this.instance;
        }

        if (this.isInitializing) {
        // Return the ongoing initialization promise
        if (this.initializationPromise) {
            return await this.initializationPromise;
        }
        }

        this.isInitializing = true;
        this.initializationPromise = this.createInstance();
        
        try {
        this.instance = await this.initializationPromise;
        return this.instance;
        } finally {
        this.isInitializing = false;
        this.initializationPromise = null;
        }
    }

    private static async createInstance(): Promise<WebContainer> {
        const container = await WebContainer.boot();
        return container;
    }

    // Remove dispose method since it doesn't exist in newer versions
    static clearInstance(): void {
        this.instance = null;
    }

    static isInitialized(): boolean {
        return this.instance !== null;
    }
}

export default WebContainerManager;
