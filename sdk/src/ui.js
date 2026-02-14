import { Store } from './store.js';
import { styles } from './styles.js';
import { sendMessage as sendToGrok } from './api.js';
import { extractPageContext } from './context.js';
import { parseAndExecute } from './agent.js';
import { VoiceHandler } from './voice.js';
import { NavigationAgent } from './navigationAgent.js';
import { isNavigationRequest } from './utils/intentParser.js';
import { engagementTriggers } from './sales/engagementTriggers.js';
import { behaviorTracker } from './utils/behaviorTracker.js';

const SVGs = {
  notchIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 19.2C9.5 19.2 7.29 17.92 6 16C6.03 14 10 12.9 12 12.9C13.99 12.9 17.97 14 18 16C16.71 17.92 14.5 19.2 12 19.2Z" fill="black"/></svg>`, // Placeholder
  mic: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`,
  send: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  stop: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`
};

export function createUI() {
  const rootId = 'blitsum-root';
  if (document.getElementById(rootId)) return; // Prevent double init

  // Initialize Navigation Agent
  const pageContext = extractPageContext();
  const navAgent = new NavigationAgent(pageContext);

  const container = document.createElement('div');
  container.id = rootId;
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });

  // Inject Styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  shadow.appendChild(styleSheet);

  // Main Container
  const wrapper = document.createElement('div');
  wrapper.className = 'notch-container';

  // Initial HTML Structure
  wrapper.innerHTML = `
      <!-- Floating Messages Area -->
      <div class="chat-messages" id="chat-messages">
      </div>
  
      <!-- The Notch / Input Bar -->
      <div class="notch">
        <!-- Collapsed Content -->
        <div class="notch-content">
          <div class="notch-icon"></div>
          <span style="font-size: 14px; font-weight: 500;">Ask AI</span>
        </div>
  
        <!-- Expanded Content (Input Interface) -->
        <div class="input-interface">
          <div class="input-wrapper">
            <input type="text" class="chat-input" placeholder="Ask Blitsum..." />
            
            <div class="actions">
               <button class="voice-btn" id="voice-btn">
                ${SVGs.mic}
              </button>
              <button class="send-btn">
                ${SVGs.send}
              </button>
            </div>
          </div>
        </div>

        <!-- Voice Mode Interface -->
        <div class="voice-interface">
            <button class="voice-close-btn">
                ${SVGs.close}
            </button>
            <div class="voice-waveform">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>
        </div>
      </div>
    `;

  shadow.appendChild(wrapper);

  // Event Listeners

  // Hover & Expand Logic
  const notch = wrapper.querySelector('.notch');
  const chatMessages = wrapper.querySelector('#chat-messages');
  let closeTimeout;

  const openSDK = () => {
    // If in voice mode, don't just "open" the text input unnecessarily on hover
    // But if we are closed and hover, we usually go to text mode.
    // If we are ALREADY in voice mode, we stay in voice mode.
    const state = Store.getState();
    if (state.isVoiceMode) return;

    clearTimeout(closeTimeout);
    Store.setState({ isOpen: true });
  };

  const closeSDK = () => {
    // If in voice mode, do not auto-close on mouseleave
    const state = Store.getState();
    if (state.isVoiceMode) return;

    // Do not close if cursor is over an AI message bubble
    if (document.querySelector('.message-bubble.ai:hover')) return;

    // Do not close if there are AI messages visible (prevents closing during conversation)
    const hasMessages = messagesContainer.querySelector('.message-bubble.ai');
    if (hasMessages) return;

    closeTimeout = setTimeout(() => {
      Store.setState({ isOpen: false });
    }, 150); // Reduced delay for faster response
  };

  // Close notch and remove messages when clicking outside
  document.addEventListener('click', (e) => {
    // Don't close if in voice mode
    const state = Store.getState();
    if (state.isVoiceMode) return;

    // Determine if click is inside the SDK shadow DOM
    let clickedInside = false;
    let element = e.target;
    while (element) {
      if (element === wrapper || element === container) {
        clickedInside = true;
        break;
      }
      element = element.parentElement || element.getRootNode()?.host;
    }

    if (!clickedInside) {
      // Remove all AI messages and close the notch after 1 ms
      setTimeout(() => {
        const messages = messagesContainer.querySelectorAll('.message-bubble.ai');
        messages.forEach(msg => msg.remove());
        Store.setState({ isOpen: false, isVoiceMode: false });
      }, 1);
    }
  });

  // Attach listeners to interactive elements
  notch.addEventListener('mouseenter', openSDK);
  notch.addEventListener('mouseleave', closeSDK);

  chatMessages.addEventListener('mouseenter', openSDK);
  chatMessages.addEventListener('mouseleave', closeSDK);

  // State Subscription to update UI
  Store.subscribe((state) => {
    if (state.isVoiceMode) {
      wrapper.classList.remove('expanded'); // Remove expanded to collapse text input
      wrapper.classList.add('voice-mode');
      // We might want to keep 'expanded' if we want the notch to look big, but the design is "colid back" (smaller?)
      // The user says "Notch colids back", implying it shrinks or changes shape.
    } else {
      wrapper.classList.remove('voice-mode');
      if (state.isOpen) {
        wrapper.classList.add('expanded');
        // Focus input when opening text mode
        setTimeout(() => wrapper.querySelector('.chat-input').focus(), 100);
      } else {
        wrapper.classList.remove('expanded');
        wrapper.querySelector('.chat-input').blur();
      }
    }
  });

  // Chat Logic (Basic Demo)
  const input = wrapper.querySelector('.chat-input');
  const sendBtn = wrapper.querySelector('.send-btn');
  const messagesContainer = wrapper.querySelector('#chat-messages');
  const voiceBtn = wrapper.querySelector('#voice-btn');
  const voiceCloseBtn = wrapper.querySelector('.voice-close-btn');

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    // Ensure only one AI reply is visible
    const existingAIs = messagesContainer.querySelectorAll('.message-bubble.ai');
    existingAIs.forEach(ai => ai.remove());

    // Check if this is a navigation request
    const isNavRequest = isNavigationRequest(text);

    // Create the AI message bubble immediately
    const aiMsg = document.createElement('div');
    aiMsg.className = 'message-bubble ai';

    // Only show loading dots if we don't have streaming data yet
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'typing-indicator';
    loadingIndicator.innerHTML = `<span></span><span></span><span></span>`;
    aiMsg.appendChild(loadingIndicator);

    messagesContainer.appendChild(aiMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Extract page context for AI
    const pageContext = extractPageContext();

    if (isNavRequest) {
      navAgent.navigate(text).then(result => {
        loadingIndicator.remove();
        aiMsg.textContent = result;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
      return;
    }

    // Stream handler
    let fullText = "";

    sendToGrok(text, pageContext, {
      onChunk: (chunk) => {
        // Remove loading indicator on first chunk
        if (loadingIndicator.parentNode) {
          loadingIndicator.remove();
        }

        fullText += chunk;
        // Parse actions from the chunk if possible? 
        // Actually, usually actions come at the end in a JSON block.
        // For now, we just display the raw text (action JSON might be visible momentarily)
        // Ideally we separate content from JSON actions, but for speed we stream everything.

        // Simple robust display: use the accumulated text
        // Note: Use textContent to avoid XSS, but parseAndExecute handles logic later
        aiMsg.textContent = fullText;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }).then(aiResponse => {
      // Final pass to execute actions and cleanup display (remove JSON if present)
      const displayText = parseAndExecute(aiResponse);
      if (displayText !== aiResponse) {
        aiMsg.textContent = displayText;
      }
    }).catch(err => {
      console.error('Error sending message:', err);
      if (loadingIndicator.parentNode) loadingIndicator.remove();
      aiMsg.classList.add('error');
      aiMsg.textContent = 'Sorry, I encountered an error. Please try again.';
    });
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Voice Mode Logic with Advanced Handler
  let voiceHandler = null;
  let voiceStatusIndicator = null;

  voiceBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const state = Store.getState();

    if (!state.isVoiceMode) {
      // Start voice mode
      Store.setState({ isVoiceMode: true, isOpen: true });

      // Create status indicator
      voiceStatusIndicator = document.createElement('div');
      voiceStatusIndicator.className = 'voice-status-indicator voice-listening';
      voiceStatusIndicator.textContent = 'Listening...';
      wrapper.appendChild(voiceStatusIndicator);

      try {
        voiceHandler = new VoiceHandler();

        await voiceHandler.start(
          // onResponse callback
          async (userMessage) => {
            // Remove any existing AI messages (only show latest)
            const existingAIs = messagesContainer.querySelectorAll('.message-bubble.ai');
            existingAIs.forEach(ai => ai.remove());

            // Get AI response with context
            const pageContext = extractPageContext();
            const rawResponse = await sendToGrok(userMessage, pageContext);
            const displayText = parseAndExecute(rawResponse);

            // Show AI message
            const aiMsg = document.createElement('div');
            aiMsg.className = 'message-bubble ai';
            aiMsg.textContent = displayText;
            messagesContainer.appendChild(aiMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            return displayText;
          },
          // onStatusChange callback
          (status) => {
            if (voiceStatusIndicator) {
              const waveform = wrapper.querySelector('.voice-waveform');
              if (status === 'ai-speaking' || status === 'speaking') {
                waveform?.classList.add('active');
              } else {
                waveform?.classList.remove('active');
              }

              switch (status) {
                case 'listening':
                  voiceStatusIndicator.textContent = 'Listening...';
                  voiceStatusIndicator.className = 'voice-status-indicator voice-listening';
                  break;
                case 'speaking':
                  voiceStatusIndicator.textContent = 'You\'re speaking...';
                  voiceStatusIndicator.className = 'voice-status-indicator voice-user-speaking';
                  break;
                case 'processing':
                  voiceStatusIndicator.textContent = 'Processing...';
                  voiceStatusIndicator.className = 'voice-status-indicator voice-processing';
                  break;
                case 'ai-speaking':
                  voiceStatusIndicator.textContent = 'AI is speaking...';
                  voiceStatusIndicator.className = 'voice-status-indicator voice-ai-speaking';
                  break;
              }
            }
          }
        );
      } catch (error) {
        console.error('Failed to start voice mode:', error);

        // Show browser-specific error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message-bubble ai error';
        errorMsg.textContent = error.message || 'Voice mode is not supported in your browser or microphone access was denied.';
        messagesContainer.appendChild(errorMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        Store.setState({ isVoiceMode: false });
        if (voiceStatusIndicator) {
          voiceStatusIndicator.remove();
          voiceStatusIndicator = null;
        }
      }
    }
  });

  const exitVoiceMode = (e) => {
    e.stopPropagation();

    // Stop voice handler
    if (voiceHandler) {
      voiceHandler.stop();
      voiceHandler = null;
    }

    // Remove status indicator
    if (voiceStatusIndicator) {
      voiceStatusIndicator.remove();
      voiceStatusIndicator = null;
    }

    Store.setState({ isVoiceMode: false, isOpen: true });
  };

  voiceCloseBtn.addEventListener('click', exitVoiceMode);

  // Initialize engagement triggers for proactive messaging
  initializeEngagementTriggers(messagesContainer, sendBtn);
}

/**
 * Initialize engagement triggers for proactive messaging
 */
function initializeEngagementTriggers(messagesContainer, sendBtn) {
  // Initialize behavior tracker
  behaviorTracker.init();

  // Initialize engagement triggers
  engagementTriggers.init();

  // Listen for trigger events
  engagementTriggers.addListener((trigger) => {
    console.log('[UI] Engagement trigger fired:', trigger.id);

    // Simulate proactive message from AI
    sendProactiveMessage(trigger.message, messagesContainer);
  });

  console.log('[UI] Engagement triggers initialized');
}

/**
 * Send a proactive message from the AI
 */
function sendProactiveMessage(message, messagesContainer) {
  // Open the SDK to show the message
  Store.setState({ isOpen: true });

  // Remove any existing AI bubbles
  const existingAIs = messagesContainer.querySelectorAll('.message-bubble.ai');
  existingAIs.forEach(ai => ai.remove());

  // Add AI Message
  const aiMsg = document.createElement('div');
  aiMsg.className = 'message-bubble ai proactive';
  aiMsg.textContent = message;
  messagesContainer.appendChild(aiMsg);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  console.log('[UI] Sent proactive message:', message);
}
