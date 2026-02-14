/**
 * Murf Falcon WebSocket Voice Client
 * Handles real-time text-to-speech streaming with gapless playback
 */
export class MurfFalconClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.wsUrl = "wss://global.api.murf.ai/v1/speech/stream-input";
        this.sampleRate = 44100;
        this.socket = null;
        this.audioContext = null;
        this.nextPlayTime = 0;
        this.isPlaying = false;
        this.wavHeaderSet = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.reconnectDelay = 2000;
        this.activeSources = new Set();
        this.onStatusChange = null;
        this.currentContextId = null;

        // Completion tracking
        this.currentSpeakResolve = null;
        this.currentSpeakReject = null;
        this.hasReceivedFinal = false;
    }

    /**
     * Connect to Murf Falcon via WebSocket
     */
    async connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                // Initialize AudioContext on user gesture (or when connect is called)
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                        sampleRate: this.sampleRate
                    });
                }

                console.log('[MurfClient] Connecting...');
                const wsParams = new URLSearchParams({
                    'api-key': this.apiKey,
                    'model': 'FALCON',
                    'sample_rate': this.sampleRate.toString(),
                    'channel_type': 'MONO',
                    'format': 'WAV'
                });
                this.socket = new WebSocket(`${this.wsUrl}?${wsParams.toString()}`);

                this.socket.onopen = () => {
                    console.log('[MurfClient] WebSocket connected');
                    this.reconnectAttempts = 0;
                    if (this.onStatusChange) this.onStatusChange('connected');
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.audio) {
                            this.scheduleAudioChunk(data.audio);
                        }

                        if (data.isFinalAudio) {
                            console.log('[MurfClient] Final audio chunk received');
                            this.hasReceivedFinal = true;
                            // Check if we are already done playing (in case final packet arrived after audio finished?)
                            // Unlikely, but possible if audio was very short.
                            this.checkPlaybackCompletion();
                        }

                        if (data.error) {
                            console.error('[MurfClient] ❌ API Error:', data.error);
                            if (this.onStatusChange) this.onStatusChange('error');
                            this.isPlaying = false;

                            if (this.currentSpeakReject) {
                                this.currentSpeakReject(new Error(data.error));
                                this.clearPendingPromise();
                            }
                        }
                    } catch (err) {
                        console.error('[MurfClient] Error parsing message:', err);
                    }
                };

                this.socket.onclose = (event) => {
                    console.log('[MurfClient] WebSocket closed:', event.code, event.reason);
                    this.handleReconnect();
                    if (this.onStatusChange) this.onStatusChange('disconnected');
                };

                this.socket.onerror = (err) => {
                    console.error('[MurfClient] WebSocket error:', err);
                    reject(err);
                };
            } catch (error) {
                console.error('[MurfClient] Connection error:', error);
                reject(error);
            }
        });
    }

    /**
     * Stream text to speech and wait for completion
     * @param {string} text - Text to synthesize
     * @returns {Promise<void>} Resolves when audio finishes playing
     */
    async speak(text) {
        // Ensure connection
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            await this.connect();
        }

        // Reset state for new utterance
        this.flushBuffer();
        this.hasReceivedFinal = false;

        // Cancel previous promise if exists
        if (this.currentSpeakReject) {
            this.currentSpeakReject(new Error('Interrupted by new speech'));
            this.clearPendingPromise();
        }

        // End previous context if needed
        if (this.currentContextId) {
            this.socket.send(JSON.stringify({
                text: "",
                context_id: this.currentContextId,
                end: true
            }));
        }

        return new Promise((resolve, reject) => {
            this.currentSpeakResolve = resolve;
            this.currentSpeakReject = reject;
            this.isPlaying = true;

            const voiceConfig = {
                voiceId: "en-US-ken",
                style: "Conversational",
                sampleRate: this.sampleRate,
                format: "WAV",
                channelType: "MONO",
                encodeAsBase64: true,
                variation: 1
            };

            const contextId = "v_" + Date.now();
            this.currentContextId = contextId;

            this.socket.send(JSON.stringify({
                voice_config: voiceConfig,
                context_id: contextId
            }));

            this.socket.send(JSON.stringify({
                text: text,
                context_id: contextId,
                end: true
            }));
        });
    }

    /**
     * Convert and schedule audio chunks
     */
    scheduleAudioChunk(base64Chunk) {
        try {
            const float32Array = this.decodeChunk(base64Chunk);
            if (!float32Array || float32Array.length === 0) return;

            if (this.audioContext.state === "suspended") {
                this.audioContext.resume();
            }

            const buffer = this.audioContext.createBuffer(1, float32Array.length, this.sampleRate);
            buffer.copyToChannel(float32Array, 0);

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);

            const now = this.audioContext.currentTime;

            // Gapless scheduling logic
            if (this.nextPlayTime < now) {
                this.nextPlayTime = now + 0.05; // Small buffer for network jitter
            }

            source.start(this.nextPlayTime);
            this.nextPlayTime += buffer.duration;

            this.activeSources.add(source);
            source.onended = () => {
                this.activeSources.delete(source);
                this.checkPlaybackCompletion();
            };

        } catch (error) {
            console.error('[MurfClient] Error scheduling chunk:', error);
        }
    }

    /**
     * Check if playback is finished
     */
    checkPlaybackCompletion() {
        // We are done if:
        // 1. We received the final audio packet from server
        // 2. No sources are currently playing
        if (this.hasReceivedFinal && this.activeSources.size === 0) {
            this.isPlaying = false;
            this.wavHeaderSet = false;
            if (this.onStatusChange) this.onStatusChange('idle');

            if (this.currentSpeakResolve) {
                console.log('[MurfClient] Playback complete');
                this.currentSpeakResolve();
                this.clearPendingPromise();
            }
        }
    }

    clearPendingPromise() {
        this.currentSpeakResolve = null;
        this.currentSpeakReject = null;
    }

    /**
     * Decode base64 PCM/WAV to Float32Array
     */
    decodeChunk(base64) {
        try {
            const binary = atob(base64);
            const byteArray = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                byteArray[i] = binary.charCodeAt(i);
            }

            let offset = 0;
            const isWav = byteArray[0] === 0x52 && byteArray[1] === 0x49 && byteArray[2] === 0x46 && byteArray[3] === 0x46;

            if (isWav) {
                offset = 44;
                if (!this.wavHeaderSet) {
                    this.wavHeaderSet = true;
                }
            }

            const length = byteArray.length - offset;
            if (length <= 0) return null;

            const sampleCount = Math.floor(length / 2);
            const float32Array = new Float32Array(sampleCount);
            const dataView = new DataView(byteArray.buffer, offset);

            for (let i = 0; i < sampleCount; i++) {
                try {
                    const int16 = dataView.getInt16(i * 2, true);
                    float32Array[i] = int16 / 32768;
                } catch (e) { break; }
            }

            return float32Array;
        } catch (e) {
            console.error('[MurfClient] Decoding error:', e);
            return null;
        }
    }

    flushBuffer() {
        this.activeSources.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        this.activeSources.clear();
        this.nextPlayTime = this.audioContext ? this.audioContext.currentTime : 0;
        this.wavHeaderSet = false;
        this.isPlaying = false;
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), this.reconnectDelay);
        }
    }

    disconnect() {
        this.flushBuffer();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (this.currentSpeakReject) {
            this.currentSpeakReject(new Error('Disconnected'));
            this.clearPendingPromise();
        }
    }
}
