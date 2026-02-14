/**
 * Fallback TTS using browser's native Speech Synthesis API
 * Used when Murf API is unavailable or hits rate limits
 */
export class BrowserTTSClient {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.onStatusChange = null;
        this.isPlaying = false;
    }

    /**
     * Connect (no-op for browser TTS, but keeps API consistent)
     */
    async connect() {
        if (!this.synthesis) {
            throw new Error('Browser Speech Synthesis not supported');
        }
        console.log('[BrowserTTS] Ready to speak');
        return Promise.resolve();
    }

    /**
     * Speak text using browser TTS
     * @param {string} text - Text to synthesize
     */
    async speak(text) {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance = utterance;

            // Configure voice (prefer natural-sounding voices)
            const voices = this.synthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Samantha') || // macOS
                v.name.includes('Google') ||    // Chrome
                v.name.includes('Natural') ||
                v.lang.startsWith('en-US')
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            // Configure speech parameters
            utterance.rate = 1.0;   // Normal speed
            utterance.pitch = 1.0;  // Normal pitch
            utterance.volume = 1.0; // Full volume

            // Event handlers
            utterance.onstart = () => {
                console.log('[BrowserTTS] Started speaking');
                this.isPlaying = true;
                if (this.onStatusChange) {
                    this.onStatusChange('speaking');
                }
            };

            utterance.onend = () => {
                console.log('[BrowserTTS] Finished speaking');
                this.isPlaying = false;
                if (this.onStatusChange) {
                    this.onStatusChange('idle');
                }
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('[BrowserTTS] Error:', event.error);
                this.isPlaying = false;
                if (this.onStatusChange) {
                    this.onStatusChange('error');
                }
                reject(new Error(`Speech synthesis failed: ${event.error}`));
            };

            // Start speaking
            this.synthesis.speak(utterance);
        });
    }

    /**
     * Interrupt current speech
     */
    interrupt() {
        console.log('[BrowserTTS] Interrupting speech');
        this.synthesis.cancel();
        this.isPlaying = false;
        if (this.onStatusChange) {
            this.onStatusChange('idle');
        }
    }

    /**
     * Stop and cleanup
     */
    disconnect() {
        this.synthesis.cancel();
        this.isPlaying = false;
    }
}
