// lib/voice-integration.ts
"use client"

export class VoiceIntegration {
    private recognition: any = null;
    private synthesis: SpeechSynthesis | null = null;
    private isListening: boolean = false;
    private onResult?: (text: string) => void;
    private onError?: (error: string) => void;

    constructor() {
        this.initializeSpeechRecognition();
        this.initializeSpeechSynthesis();
    }

    /**
     * Initialize Speech Recognition (Voice Input)
     */
    private initializeSpeechRecognition(): void {
        if (typeof window === 'undefined') return;

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (this.onResult) {
                this.onResult(transcript);
            }
            this.isListening = false;
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (this.onError) {
                this.onError(event.error);
            }
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };
    }

    /**
     * Initialize Speech Synthesis (Voice Output)
     */
    private initializeSpeechSynthesis(): void {
        if (typeof window === 'undefined') return;

        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        } else {
            console.warn('Speech Synthesis not supported in this browser');
        }
    }

    /**
     * Start listening for voice input
     */
    startListening(
        onResult: (text: string) => void,
        onError?: (error: string) => void
    ): boolean {
        if (!this.recognition) {
            console.error('Speech Recognition not available');
            return false;
        }

        if (this.isListening) {
            console.warn('Already listening');
            return false;
        }

        this.onResult = onResult;
        this.onError = onError;

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            return false;
        }
    }

    /**
     * Stop listening
     */
    stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Speak text (Text-to-Speech)
     */
    speak(text: string, options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        voice?: SpeechSynthesisVoice;
    }): boolean {
        if (!this.synthesis) {
            console.error('Speech Synthesis not available');
            return false;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (options) {
            if (options.rate) utterance.rate = options.rate;
            if (options.pitch) utterance.pitch = options.pitch;
            if (options.volume) utterance.volume = options.volume;
            if (options.voice) utterance.voice = options.voice;
        }

        try {
            this.synthesis.speak(utterance);
            return true;
        } catch (error) {
            console.error('Error speaking:', error);
            return false;
        }
    }

    /**
     * Stop speaking
     */
    stopSpeaking(): void {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    /**
     * Check if currently listening
     */
    isCurrentlyListening(): boolean {
        return this.isListening;
    }

    /**
     * Check if currently speaking
     */
    isCurrentlySpeaking(): boolean {
        return this.synthesis ? this.synthesis.speaking : false;
    }

    /**
     * Get available voices
     */
    getVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }

    /**
     * Check if voice features are supported
     */
    static isSupported(): {
        recognition: boolean;
        synthesis: boolean;
    } {
        return {
            recognition: !!(
                typeof window !== 'undefined' &&
                ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
            ),
            synthesis: !!(
                typeof window !== 'undefined' &&
                'speechSynthesis' in window
            )
        };
    }
}

// Singleton instance
export const voiceIntegration = new VoiceIntegration();
