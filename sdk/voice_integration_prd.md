# PRD: Advanced Voice AI Integration (Murf Falcon)

## 1. Executive Summary
This document serves as the implementation blueprint for integrating Murf Falcon TTS into the Blitsum SDK. The goal is to evolve the current Web Speech API implementation into a high-performance, edge-optimized Voice AI capable of sub-150ms latency, multi-lingual code-mixing, and natural interruptions.

---

## 2. Technical Feasibility Analysis (Against Official Murf Falcon API)

Based on a cross-reference with the [Murf AI API Documentation](https://murf.ai/docs):

- **Model Latency**: Falcon's ~130ms TTFA (Time To First Audio) is verified.
- **Code-Mixing**: Supported via **"Multinative"** voice capabilities (e.g., `en-US-ken` can handle interspersed Hindi or Spanish).
- **Interruption Support**: Feasible using **`context_id`** and the **`clear`** parameter to stop specific turns.
- **Granular Control**: Verified support for **Pitch (-50 to 50)**, **Rate (-50 to 50)**, and **Styles** (cheerful, sad, etc.).
- **Edge Routing**: Verified `global.api.murf.ai` Anycast endpoint for regional optimization.

### 2.1. Next.js Architecture Compatibility
The implementation is feasible within the current architecture. While the SDK is Vanilla JS (client-side), the following is recommended:
1.  **Direct WebSocket**: Client-side `new WebSocket()` can connect directly to Murf.
2.  **Security Note**: In production, the SDK should request a short-lived session token from a Next.js API route to avoid exposing the Murf Master API Key in the browser.

---

## 3. Implementation Steps

### Phase 1: Core WebSocket Infrastructure
- [ ] **Persistent Connection**: Replace current `speak()` promise-based logic in `voice.js` with a persistent WebSocket class.
- [ ] **Heartbeat & Reconnect**: Implement a 'keep-alive' heartbeat (every 30s) and auto-reconnect logic for stable browser sessions.
- [ ] **Audio Buffering**: Use `AudioWorklet` or a simple `MediaSource` buffer to play `pcm_s16le` chunks as they arrive from Murf.

### Phase 2: Interruption & Context Management
- [ ] **VAD Implementation**: Integrate a lightweight Voice Activity Detection (VAD) library (e.g., `vad.js`) to detect user speech *while* AI is talking.
- [ ] **Clear Signal**: When VAD triggers, send a `{"type": "clear", "context_id": "current_turn"}` message to Murf to stop synthesis immediately.
- [ ] **Abort Stream**: Stop local audio playback immediately upon VAD detection.

### Phase 3: Emotion & Style Engine
- [ ] **Sentiment Hook**: Connect `api.js` sentiment analysis results to the `VoiceHandler`.
- [ ] **Mapping Logic**: Create a map of Sales Stages (Discovery, Objection, Closing) to Falcon parameters:
    - *Objection*: `pitch: -10`, `rate: -10`, `style: "peaceful"`
    - *Closing*: `pitch: +15`, `rate: +10`, `style: "cheerful"`

### Phase 4: Proactive "Whisper" Nudges
- [ ] **Logic Integration**: Link `behaviorTracker.js` signals (e.g., `exit-intent`) to the `NudgeManager`.
- [ ] **Pre-Caching**: During SDK `init()`, pre-generate audio for the top 5 common nudges using the Murf REST API to ensure 0ms playback latency when triggered.

---

## 4. Proposed File Changes

### `sdk/src/voice.js`
- Migrate from `speechSynthesis` to `WebSocket`.
- Add `handleInterruption()` method.
- Add `updateVoiceMode(sentiment, stage)` method.

### `sdk/src/api.js`
- Update `sendMessage` to include `context_id` in the metadata/payload.
- Enhance prompt to return "Emotion Tags" that the SDK can parse.

### `sdk/src/utils/behaviorTracker.js`
- Add `onNudgeTriggered` listener to pipe events to `voice.js`.

---

## 5. Success Metrics
- **End-to-End Latency**: <150ms (User stops talking -> AI starts audio).
- **Engagement**: 20%+ increase in Voice Mode activations via proactive nudges.
- **Conversion**: 5%+ increase in CTA clicks when using "Emotion-Aware" closing styles.

---
*Verified against Murf Falcon API v1.0 (Beta).*
