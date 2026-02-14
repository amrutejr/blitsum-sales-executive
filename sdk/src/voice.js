import { MurfFalconClient } from './utils/murf.js';
import { Store } from './store.js';

export class VoiceHandler {
    constructor() {
        this.recognition = null;

        // Get Murf API Key from config or environment
        const config = Store.getState().config || {};
        const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MURF_API_KEY);
        const murfKey = config.murfApiKey || envKey || 'ap2_6c04b66d-d001-415c-a8e8-7510c9262174';

        this.murfClient = new MurfFalconClient(murfKey);
        this.isListening = false;
        this.isSpeaking = false;
        this.silenceTimer = null;
        this.silenceThreshold = 800; // 0.8 seconds of silence for snappier response
        this.transcript = '';
        this.onResponseCallback = null;
        this.onStatusChange = null;
        this.browserInfo = this.detectBrowser();
    }

    /**
     * Detect browser and its capabilities
     */
    detectBrowser() {
        const ua = navigator.userAgent;
        const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
        const isSafari = /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor);
        const isFirefox = /Firefox/.test(ua);
        const isEdge = /Edg/.test(ua);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const hasSpeechRecognition = !!SpeechRecognition;
        const hasSpeechSynthesis = 'speechSynthesis' in window;

        return {
            isChrome,
            isSafari,
            isFirefox,
            isEdge,
            hasSpeechRecognition,
            hasSpeechSynthesis,
            name: isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Unknown'
        };
    }

    /**
     * Start voice mode
     * @param {Function} onResponse - Callback to get AI response
     * @param {Function} onStatusChange - Callback for status updates
     */
    async start(onResponse, onStatusChange) {
        this.onResponseCallback = onResponse;
        this.onStatusChange = onStatusChange;

        // Initialize Murf Falcon Connection early (within user gesture)
        try {
            console.log('[VoiceHandler] Initializing Murf link...');
            await this.murfClient.connect();
        } catch (err) {
            console.warn('[VoiceHandler] Pre-connection failed, will retry on speak:', err);
        }

        // Check browser support with detailed error messages
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            const errorMessage = this.getBrowserSpecificError();
            throw new Error(errorMessage);
        }

        // Check for HTTPS (required for mic access in most browsers)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            throw new Error('Voice mode requires HTTPS or localhost. Please use a secure connection.');
        }

        this.recognition = new SpeechRecognition();

        // Configure for continuous recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onresult = this.handleSpeechResult.bind(this);
        this.recognition.onend = this.handleRecognitionEnd.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
        this.recognition.onstart = () => {
            console.log('[VoiceHandler] Recognition started successfully');
            this.updateStatus('listening');
        };

        try {
            console.log(`[VoiceHandler] Starting voice mode in ${this.browserInfo.name}`);
            this.recognition.start();
            this.isListening = true;
        } catch (error) {
            console.error('Failed to start recognition:', error);
            throw new Error(`Failed to start voice mode: ${error.message}. Please ensure microphone permissions are granted.`);
        }
    }

    /**
     * Get browser-specific error message
     */
    getBrowserSpecificError() {
        if (this.browserInfo.isFirefox) {
            return 'Voice mode is not supported in Firefox. Please use Chrome, Edge, or Safari for voice features.';
        } else if (this.browserInfo.isSafari) {
            return 'Voice mode has limited support in Safari. For best experience, please use Chrome or Edge.';
        } else {
            return 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
        }
    }

    /**
     * Handle speech recognition results
     */
    handleSpeechResult(event) {
        // NATURAL INTERRUPTION: If user starts speaking while AI is talking, stop the AI
        if (this.isSpeaking) {
            console.log('[VoiceHandler] User interrupted AI speech');
            this.interrupt();
        }

        // Clear silence timer (user is speaking)
        clearTimeout(this.silenceTimer);
        this.updateStatus('speaking');

        // Get latest transcript
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;

        if (result.isFinal) {
            this.transcript += transcript + ' ';

            // Start silence detection
            this.silenceTimer = setTimeout(() => {
                this.processSpeech();
            }, this.silenceThreshold);

            this.updateStatus('listening');
        }
    }

    /**
     * Process speech after silence detected
     */
    async processSpeech() {
        if (!this.transcript.trim()) return;

        const userMessage = this.transcript.trim();
        this.transcript = '';

        this.updateStatus('processing');

        try {
            // Get AI response
            if (this.onResponseCallback) {
                const aiResponse = await this.onResponseCallback(userMessage);
                await this.speak(aiResponse);
            }
        } catch (error) {
            console.error('Error processing speech:', error);
            this.updateStatus('listening');
        }
    }

    /**
     * Text-to-speech using Murf Falcon WebSocket
     */
    async speak(text) {
        // PAUSE RECOGNITION WHILE AI IS SPEAKING (prevents feedback)
        // We use comprehensive 'Walkie-Talkie' mode for stability
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                console.log('[VoiceHandler] Recognition paused for AI speech');
            } catch (error) {
                console.log('Recognition already stopped:', error);
            }
        }

        this.isSpeaking = true;
        this.updateStatus('ai-speaking');

        try {
            // Use Murf Falcon for text-to-speech
            console.log('[VoiceHandler] Speaking with Murf Falcon:', text);

            // Ensure connection is established
            if (!this.murfClient.isConnected) {
                await this.murfClient.connect();
            }

            // Speak the text and WAIT for completion (MurfClient now returns a Promise)
            await this.murfClient.speak(text);

            // Speech completed successfully
            this.handleSpeechEnd();
        } catch (error) {
            console.error('[VoiceHandler] Murf TTS failed:', error);

            // Fallback: just end the speaking state
            this.handleSpeechEnd();

            // Optionally notify user of the error
            this.updateStatus('error');
            setTimeout(() => {
                if (this.isListening) this.updateStatus('listening');
            }, 2000);
        }
    }

    /**
     * Handle end of speech
     */
    handleSpeechEnd() {
        console.log('[VoiceHandler] Speech ended, resuming listening...');
        this.isSpeaking = false;
        this.updateStatus('listening');

        // RESUME RECOGNITION AFTER AI FINISHES SPEAKING
        if (this.isListening && this.recognition) {
            setTimeout(() => {
                try {
                    // Check if still listening mode and not speaking
                    if (this.isListening && !this.isSpeaking) {
                        this.recognition.start();
                        console.log('[VoiceHandler] Recognition restarted');
                    }
                } catch (error) {
                    // If already started, this might throw, which is fine
                    console.log('Note: Recognition restart attempt:', error.message);
                }
            }, 300); // 300ms delay to clear audio buffer
        }
    }

    /**
     * Interrupt AI speech (when user starts speaking)
     * Note: In current 'Walkie-Talkie' mode (recog stopped while speaking), 
     * this won't be triggered by voice, but could be triggered by UI buttons.
     */
    interrupt() {
        if (this.isSpeaking) {
            console.log('[VoiceHandler] Interrupting speech');
            this.murfClient.flushBuffer();
            // We don't manually call handleSpeechEnd here because flushBuffer 
            // causing the pending promise to resolve/reject will trigger 
            // the 'finally' or next steps in speak().
            // But checking our logic above, if speak() is awaiting, we need to ensure it unblocks.
            // Our MurfClient update ensures this.
        }
    }

    /**
     * Stop voice mode completely
     */
    stop() {
        this.isListening = false;
        this.isSpeaking = false;
        clearTimeout(this.silenceTimer);

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) { }
            this.recognition = null;
        }

        this.murfClient.disconnect();
        this.updateStatus('idle');
    }

    /**
     * Handle recognition end (auto-restart)
     */
    handleRecognitionEnd() {
        // Auto-restart if still in voice mode
        if (this.isListening && this.recognition) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Failed to restart recognition:', error);
            }
        }
    }

    /**
     * Handle recognition errors
     */
    handleError(event) {
        console.error('Speech recognition error:', event.error);

        // Don't stop on no-speech or aborted errors
        if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
        }

        // For other errors, try to restart
        if (this.isListening) {
            setTimeout(() => {
                try {
                    this.recognition.start();
                } catch (error) {
                    console.error('Failed to restart after error:', error);
                }
            }, 1000);
        }
    }

    /**
     * Update status and notify callback
     */
    updateStatus(status) {
        if (this.onStatusChange) {
            this.onStatusChange(status);
        }
    }
}
