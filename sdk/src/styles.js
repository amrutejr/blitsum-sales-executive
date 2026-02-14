export const styles = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  /* Reset */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .notch-container {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    pointer-events: none; /* Allow clicks to pass through */
  }

  /* Chat Messages (Floating Above) */
  .chat-messages {
    position: absolute;
    bottom: 70px; /* Above the notch */
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    width: 380px;
    max-height: 60vh;
    overflow-y: auto;
    padding-bottom: 20px;
    pointer-events: none; /* Let clicks pass through if empty */
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .chat-messages::-webkit-scrollbar {
    display: none;
  }

  /* When expanded, messages are interactive */
  .notch-container.expanded .chat-messages {
    pointer-events: auto;
  }

  .message-bubble {
    max-width: 100%;
    padding: 12px 18px;
    border-radius: 20px;
    font-size: 15px;
    line-height: 1.5;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    animation: message-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes message-appear {
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .message-bubble.ai {
    background: rgba(40, 40, 40, 0.95);
    color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .message-bubble.user {
    background: #007AFF; /* Apple Blue */
    color: white;
    align-self: flex-end; /* Or center? Users usually right, AI left. But here centered flex */
    /* For centered layout, usually bubbles stack. Let's keep them centered or vary? */
    /* User request image implies bubbles might be centered or standard chat. Let's start centered for Dynamic Island feel. */
  }

  /* Override alignment for bubbles in centered container */
  .message-bubble {
    align-self: center;
    text-align: center;
  }
  /* But separate slightly if we want conversation flow */
  .message-bubble.user {
    border-bottom-right-radius: 4px;
    align-self: flex-end;
    margin-right: 20px;
  }
  .message-bubble.ai {
    border-bottom-left-radius: 4px;
    align-self: flex-start;
    margin-left: 20px;
  }


  /* Notch / Input Bar */
  .notch {
    position: relative;
    background: rgba(20, 20, 20, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1), 
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      0 20px 25px -5px rgba(0, 0, 0, 0.2);
    border-radius: 100px;
    width: 120px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: white;
    cursor: pointer;
    transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s;
    pointer-events: auto;
  }

  .notch-container.expanded .notch {
    width: 420px;
    height: 60px;
    background: rgba(10, 10, 10, 0.98);
    cursor: default;
  }

  /* Notch Content (Collapsed) */
  .notch-content {
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 1;
    transition: opacity 0.2s ease;
    position: absolute;
    width: 100%;
    justify-content: center;
  }

  .notch-container.expanded .notch-content {
    opacity: 0;
    pointer-events: none;
  }

  .notch-icon {
    width: 22px;
    height: 22px;
    background: linear-gradient(135deg, #fff 0%, #a5a5a5 100%);
    border-radius: 50%;
  }

  /* Input Interface (Expanded) */
  .input-interface {
    width: 100%;
    height: 100%;
    opacity: 0;
    display: flex;
    align-items: center;
    padding: 0 8px; /* Padding for the inner pill */
    transition: opacity 0.3s ease 0.1s;
    pointer-events: none;
  }

  .notch-container.expanded .input-interface {
    opacity: 1;
    pointer-events: auto;
  }

  .input-wrapper {
    flex: 1;
    height: 44px; /* Slightly smaller than notch */
    display: flex;
    align-items: center;
    /* background: rgba(255,255,255, 0.08); Remove inner background, just use notch bg */
    border-radius: 100px;
    padding: 0 6px 0 20px;
  }

  .chat-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    font-size: 16px;
    outline: none;
    padding-right: 12px;
    height: 100%;
  }

  .chat-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .voice-btn, .send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .voice-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .voice-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .send-btn {
    background: #007AFF;
    color: white;
  }

  .send-btn:hover {
    background: #006ce6;
  }

  .voice-btn svg, .send-btn svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  /* Voice Mode Styles */
  .voice-interface {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0 12px;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.3s ease;
  }

  .notch-container.voice-mode .notch {
    width: 150px; /* Reduced width for compact voice mode */
    height: 60px;
    background: black; /* Or very dark gray */
    cursor: default;
  }

  .notch-container.voice-mode .notch-content {
    opacity: 0;
    pointer-events: none;
  }

  .notch-container.voice-mode .input-interface {
    opacity: 0;
    pointer-events: none;
  }

  .notch-container.voice-mode .voice-interface {
    opacity: 1;
    pointer-events: auto;
    transition-delay: 0.2s; /* Wait for size transition */
  }

  .voice-close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2); /* Dark gray ish */
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
  }

  .voice-close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .voice-close-btn svg {
    width: 20px;
    height: 20px;
  }

  .voice-waveform {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 24px;
  }

  .voice-waveform .bar {
    width: 4px;
    background: white;
    border-radius: 2px;
    animation: waveform 1s infinite ease-in-out;
  }

  .voice-waveform .bar:nth-child(1) { height: 10px; animation-delay: 0.0s; }
  .voice-waveform .bar:nth-child(2) { height: 18px; animation-delay: 0.1s; }
  .voice-waveform .bar:nth-child(3) { height: 24px; animation-delay: 0.2s; }
  .voice-waveform .bar:nth-child(4) { height: 18px; animation-delay: 0.3s; }
  .voice-waveform .bar:nth-child(5) { height: 10px; animation-delay: 0.4s; }

  @keyframes waveform {
    0%, 100% { transform: scaleY(0.7); opacity: 0.8; }
    50% { transform: scaleY(1.2); opacity: 1; }
  }

  /* Loading and Error States */
  .message-bubble.loading {
    background: rgba(45, 212, 191, 0.1);
    border: 1px solid rgba(45, 212, 191, 0.2);
  }

  .loading-dots {
    display: inline-block;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  .message-bubble.error {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid #ef4444;
    color: #fca5a5;
  }

  /* Pulse Animation for CTAs */
  @keyframes pulse-cta {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 30px rgba(45, 212, 191, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 10px 40px rgba(45, 212, 191, 0.6);
    }
  }

  .pulse-animation {
    animation: pulse-cta 1s ease-in-out 3;
  }

  /* Voice Status Indicators */
  .voice-status-indicator {
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 14px;
    border-radius: 14px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 1000;
    transition: all 0.3s ease;
  }

  .voice-listening {
    background: rgba(45, 212, 191, 0.15);
    color: #2DD4BF;
    border: 1px solid rgba(45, 212, 191, 0.3);
    animation: pulse-listening 2s infinite;
  }

  .voice-user-speaking {
    background: rgba(59, 130, 246, 0.15);
    color: #3B82F6;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .voice-processing {
    background: rgba(251, 191, 36, 0.15);
    color: #FBBF24;
    border: 1px solid rgba(251, 191, 36, 0.3);
    animation: pulse-processing 1s infinite;
  }

  .voice-ai-speaking {
    background: rgba(139, 92, 246, 0.15);
    color: #8B5CF6;
    border: 1px solid rgba(139, 92, 246, 0.3);
  }

  @keyframes pulse-listening {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
    50% { opacity: 1; transform: translateX(-50%) scale(1.02); }
  }

  @keyframes pulse-processing {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  /* Active waveform during voice mode */
  .voice-waveform.active .bar {
    animation: waveform-active 0.5s infinite ease-in-out;
  }

  @keyframes waveform-active {
    0%, 100% { transform: scaleY(0.5); }
    50% { transform: scaleY(1.5); }
  }
`;
