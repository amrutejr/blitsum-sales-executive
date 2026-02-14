# Product Requirements Document: Blitsum AI SDK

## 1. Vision & Overview
**Blitsum** is a lightweight, framework-agnostic JavaScript SDK that injects an "Elite AI Sales Assistant" into any website. It appears as a minimalist, "Dynamic Island" style notch that expands into a powerful conversational interface capable of text and real-time voice interaction.

The vision is to transform static websites into interactive sales funnels where the AI proactively engages users, answers questions with perfect site-context, and guides them toward conversion via auto-navigation and visual cues.

---

## 2. Core Personas
- **The Browser/Visitor**: Needs immediate answers about pricing, features, or functionality without hunting through pages.
- **The Sales Team**: Wants to capture intent and qualify leads 24/7 without manual intervention.
- **The Developer**: Needs a "plug-and-play" solution that doesn't break existing CSS/JS and works on any stack.

---

## 3. Product Features

### 3.1. Floating "Notch" UI
- **Minimalist Design**: A subtle notch at the bottom-center/right of the screen.
- **State Machine**:
  - **IDLE**: Compact icon/label.
  - **HOVER/OPEN**: Expands into a translucent input bar (Glassmorphism).
  - **CHAT**: Floating message bubbles above the input.
  - **VOICE**: Dedicated waveform interface for natural conversation.
- **Isolation**: Uses **Shadow DOM** and scoped CSS to ensure zero conflicts with the host site.

### 3.2. Intelligent Context Extraction
- **On-the-fly Analysis**: Automatically extracts pricing plans, features, FAQs, and metadata from the current page.
- **Ground Truth**: AI is strictly constrained to use extracted data to prevent hallucinations.
- **Dynamic Prompting**: System prompts are updated in real-time based on the user's current section and behavior.

### 3.3. Advanced Voice Mode
- **Natural Conversation**: Real-time STT (Speech-to-Text) and TTS (Text-to-Speech).
- **Silence Detection**: Automatically processes speech when the user stops talking.
- **Interruption Support**: AI stops speaking immediately if the user starts talking.
- **Visual Feedback**: Dynamic waveforms and status indicators (Listening, Processing, Speaking).

### 3.4. Proactive Sales Engine
- **Behavior Tracking**: Monitors time on page, scroll depth, mouse movements, and CTA interactions.
- **Exit Intent Detection**: Detects when a user is about to leave the page and triggers a last-ditch engagement offer.
- **Engagement Triggers**: AI proactively sends "Check-in" messages (e.g., "See something you like in our Pro plan?") based on user dwell time or specific hovers.
- **Conversation Flow**: Logic-driven stages (Discovery -> Value -> Objection -> Closing).

### 3.5. Action-Oriented AI
- **Auto-Navigation**: The AI can programmatically scroll to sections (e.g., #pricing) or highlight elements mentioned in the conversation.
- **Visual Cues**: Capacity to "pulse" CTA buttons to guide user attention.

---

## 4. Technical Architecture

### 4.1. Tech Stack
- **Core**: Vanilla JavaScript (ES Modules).
- **AI Engine**: Groq API (Llama 3.3 70B).
- **Voice**: Web Speech API (Recognition & Synthesis).
- **Storage**: Custom `Store` for state management.
- **Styling**: Encapsulated CSS strings.

### 4.2. File Structure (`sdk/src`)
- `index.js`: SDK entry point and initialization.
- `ui.js`: DOM management and Shadow DOM setup.
- `api.js`: AI communication logic and prompt engineering.
- `context.js`: DOM extraction and semantic analysis.
- `voice.js`: Speech handling and silence detection.
- `agent.js`: Instruction parsing for autonomous actions.
- `navigationAgent.js`: Scroll and route management.
- `sales/`: Logic for sales flows and engagement triggers.
- `utils/`: Behavior tracking and intent parsing utility.

---

## 5. User Flow
1. **Init**: User lands on site; `window.Blitsum.init()` runs.
2. **Detection**: SDK crawls the page and builds the "Ground Truth" context.
3. **Engagement**: 
   - User hovers -> Input expands.
   - User idles for 30s -> AI sends a proactive nudge.
4. **Interaction**:
   - User types/speaks.
   - AI responds + optionally scrolls the page to relevant content.
5. **Closing**: AI encourages a CTA click or trial signup.

---

## 6. Future Roadmap
- [ ] **LiveKit Integration**: Move from Web Speech API to Low-latency RTC for better voice quality.
- [ ] **Multi-page Memory**: Persist conversation state across page navigations.
- [ ] **Analytics Dashboard**: Track conversion lifts attributed to AI interventions.
- [ ] **Visual Selector**: Allow users to "point and ask" about specific UI elements.

---
*Created for the Blitsum SDK development team. 🚀*
