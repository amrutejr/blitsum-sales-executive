/**
 * Groq API Service
 * Handles communication with Groq API for AI responses with dynamic context-aware prompts
 */

import { conversationFlow, ConversationStage } from './sales/conversationFlow.js';
import { behaviorTracker } from './utils/behaviorTracker.js';

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// API Keys from environment or fallback
const GROQ_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROK_API_KEY);

// Conversation history for multi-turn conversations
let conversationHistory = [];
const MAX_HISTORY_LENGTH = 10; // Keep last 10 messages
let isVoiceMode = false; // Track if in voice mode

/**
 * Send a message to Groq API and get AI response with page context
 * @param {string} userMessage - The user's message
 * @param {Object} pageContext - Current page context (from extractPageContext)
 * @param {Object} options - Additional options (voiceMode, etc.)
 * @returns {Promise<string>} - The AI's response
 */
export async function sendMessage(userMessage, pageContext = {}, options = {}) {
    try {
        // Update voice mode
        isVoiceMode = options.voiceMode || false;

        // Advance conversation stage
        conversationFlow.advanceStage(userMessage, conversationHistory);

        // Track message sent
        behaviorTracker.trackMessageSent();

        // Build dynamic system prompt based on page content and conversation stage
        const systemPrompt = buildSystemPrompt(pageContext);

        // Add user message to history
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Keep history manageable
        if (conversationHistory.length > MAX_HISTORY_LENGTH * 2) {
            conversationHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH * 2);
        }

        // Build messages array
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory
        ];

        const response = await fetch(GROQ_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 250
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Add AI response to history
        conversationHistory.push({
            role: 'assistant',
            content: aiResponse
        });

        // Auto-navigate if AI is talking about specific sections
        autoNavigateToRelevantSection(userMessage, aiResponse);

        return aiResponse;
    } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error('Failed to get AI response. Please try again.');
    }
}

/**
 * Build dynamic system prompt based on extracted page context
 * @param {Object} pageContext - Extracted page context
 * @returns {string} System prompt
 */
function buildSystemPrompt(pageContext) {
    const siteName = pageContext.content?.metadata?.siteName || 'this website';
    const currentSection = pageContext.currentSection || 'the page';
    const currentStage = conversationFlow.currentStage;
    const behavior = behaviorTracker.getBehavior();

    let prompt = `You are an elite AI sales assistant for ${siteName}, helping visitors and guiding them toward conversion.

CORE IDENTITY:
- Consultative, not pushy
- Value-focused, not feature-dumping
- Proactive and engaging
- Confident but humble
- Results-oriented

PERSONALITY:
- Warm, helpful, and conversational
- Concise and to the point (${isVoiceMode ? 'max 50 words' : 'max 80 words'} per response)
- Professional but friendly
- Always end with a question or clear next step
- Push toward conversion naturally

CURRENT CONTEXT:
User is viewing: ${currentSection}
Page: ${pageContext.title || 'Website'}
Time on page: ${behavior.timeOnPage}s
Pricing viewed: ${behavior.pricingViewed ? 'Yes' : 'No'}
CTA interactions: ${behavior.ctaHovered} hovers, ${behavior.ctaClicked ? 'clicked' : 'not clicked'}

${conversationFlow.getStagePrompt(currentStage)}

${isVoiceMode ? `
VOICE MODE SPECIFIC:
- Keep responses under 50 words (15 seconds max)
- Use conversational language
- Ask yes/no questions for easy voice responses
- Provide clear voice commands
- Confirm understanding before moving forward

VOICE CTA EXAMPLES:
- "Say 'yes' to start your free trial"
- "Say 'pricing' to see our plans"
- "Say 'help' if you have questions"
` : ''}

PROACTIVE ENGAGEMENT RULES:
- Don't wait for user to ask - guide the conversation
- Ask qualifying questions early
- Create urgency with time-sensitive offers
- Use social proof to build trust
- Always include a clear next step/CTA
- Push toward conversion naturally

CONVERSION TACTICS:
- Scarcity: "Limited spots available"
- Urgency: "Offer ends Friday"
- Social proof: "500+ companies use this"
- Risk reversal: "14-day money-back guarantee"
- Authority: "Featured in TechCrunch"
`;

    // Add page summary if available
    if (pageContext.summary) {
        prompt += `\nPage Summary: ${pageContext.summary}\n`;
    }

    // Add pricing information if available
    if (pageContext.content?.pricing && pageContext.content.pricing.length > 0) {
        prompt += `\nPRICING PLANS (GROUND TRUTH - Use this exact information):\n`;
        pageContext.content.pricing.forEach(plan => {
            prompt += `- ${plan.plan}: ${plan.price}`;
            if (plan.popular) prompt += ` (Most Popular)`;
            prompt += `\n`;
            if (plan.features && plan.features.length > 0) {
                plan.features.slice(0, 5).forEach(feature => {
                    prompt += `  • ${feature}\n`;
                });
            }
        });
    }

    // Add features if available
    if (pageContext.content?.features && pageContext.content.features.length > 0) {
        prompt += `\nFEATURES (GROUND TRUTH):\n`;
        pageContext.content.features.slice(0, 8).forEach(feature => {
            prompt += `- ${feature.name}: ${feature.description}\n`;
        });
    }

    // Add FAQs if available
    if (pageContext.content?.faqs && pageContext.content.faqs.length > 0) {
        prompt += `\nFREQUENTLY ASKED QUESTIONS:\n`;
        pageContext.content.faqs.slice(0, 5).forEach(faq => {
            prompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
        });
    }

    // Add products if available
    if (pageContext.content?.products && pageContext.content.products.length > 0) {
        prompt += `\nPRODUCTS/SERVICES:\n`;
        pageContext.content.products.slice(0, 5).forEach(product => {
            prompt += `- ${product.name}`;
            if (product.price) prompt += ` (${product.price})`;
            prompt += `: ${product.description}\n`;
        });
    }

    // Add CTAs if available
    if (pageContext.content?.ctas && pageContext.content.ctas.length > 0) {
        prompt += `\nAVAILABLE ACTIONS:\n`;
        const uniqueCTAs = [...new Set(pageContext.content.ctas.map(cta => cta.text))];
        uniqueCTAs.slice(0, 5).forEach(ctaText => {
            prompt += `- "${ctaText}"\n`;
        });
    }

    // Add page structure for navigation
    if (pageContext.structure?.sections && pageContext.structure.sections.length > 0) {
        prompt += `\nPAGE SECTIONS:\n`;
        pageContext.structure.sections.forEach(section => {
            if (section.heading) {
                prompt += `- ${section.heading}`;
                if (section.id) prompt += ` (#${section.id})`;
                prompt += `\n`;
            }
        });
    }

    // Add action capabilities
    prompt += `\nACTION CAPABILITIES:
You can perform actions by responding with JSON on a new line:
- {"action": "scroll", "section": "section-id"} - Navigate to a section
- {"action": "highlight", "element": ".css-selector"} - Highlight an element
- {"action": "pulse_cta", "element": ".btn-primary"} - Animate a CTA button

CRITICAL RULES:
1. ONLY use information from the GROUND TRUTH sections above
2. NEVER make up pricing, features, or other details
3. If asked about something not in the context, say "I can see on this page..." and reference what IS available
4. Keep responses under 80 words
5. Always be helpful and guide users to relevant information
6. Use actions to help users navigate when appropriate

RESPONSE FORMAT:
- First: Your conversational response (concise!)
- Optional: Action JSON on a new line if you want to navigate/highlight

Example:
"Great question! Our Pro plan is $199/mo and includes unlimited messages, full voice integration, and API access. It's our most popular choice. Want to see all the details?
{"action": "scroll", "section": "pricing"}"
`;

    return prompt;
}

/**
 * Clear conversation history
 */
export function clearConversationHistory() {
    conversationHistory = [];
}

/**
 * Get current conversation history
 * @returns {Array} Conversation history
 */
export function getConversationHistory() {
    return [...conversationHistory];
}

/**
 * Format page context for display (debugging)
 * @param {Object} pageContext - Page context
 * @returns {string} Formatted context
 */
export function formatPageContext(pageContext) {
    let output = `=== PAGE CONTEXT ===\n`;
    output += `Title: ${pageContext.title}\n`;
    output += `URL: ${pageContext.url}\n`;
    output += `Current Section: ${pageContext.currentSection}\n`;
    output += `Extraction Time: ${pageContext.extractionTime}ms\n\n`;

    if (pageContext.content?.pricing?.length > 0) {
        output += `Pricing Plans: ${pageContext.content.pricing.length}\n`;
    }
    if (pageContext.content?.features?.length > 0) {
        output += `Features: ${pageContext.content.features.length}\n`;
    }
    if (pageContext.content?.faqs?.length > 0) {
        output += `FAQs: ${pageContext.content.faqs.length}\n`;
    }
    if (pageContext.content?.products?.length > 0) {
        output += `Products: ${pageContext.content.products.length}\n`;
    }
    if (pageContext.content?.ctas?.length > 0) {
        output += `CTAs: ${pageContext.content.ctas.length}\n`;
    }

    output += `\nKeywords: ${pageContext.keywords?.join(', ')}\n`;

    return output;
}

/**
 * Auto-navigate to relevant section based on conversation topic
 * @param {string} userMessage - User's message
 * @param {string} aiResponse - AI's response
 */
function autoNavigateToRelevantSection(userMessage, aiResponse) {
    // Combine messages to detect topic
    const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();

    // Define section keywords and their targets
    const sectionKeywords = {
        pricing: ['pricing', 'price', 'cost', 'plan', 'plans', 'subscription', 'how much', '$', 'starter', 'pro', 'enterprise'],
        features: ['feature', 'features', 'capability', 'capabilities', 'what can', 'what does', 'functionality'],
        contact: ['contact', 'support', 'help', 'reach', 'email', 'phone', 'talk'],
        about: ['about', 'who', 'company', 'team', 'mission']
    };

    // Check which section is being discussed
    let targetSection = null;
    let maxMatches = 0;

    for (const [section, keywords] of Object.entries(sectionKeywords)) {
        const matches = keywords.filter(keyword => combinedText.includes(keyword)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            targetSection = section;
        }
    }

    // If a clear section is identified and we have at least 2 keyword matches
    if (targetSection && maxMatches >= 2) {
        console.log(`[Auto-Navigation] Navigating to ${targetSection} section (${maxMatches} keyword matches)`);

        // Find and scroll to the section
        const sectionElement = document.getElementById(targetSection) ||
            document.querySelector(`[data-section="${targetSection}"]`) ||
            document.querySelector(`section:has(h2:contains("${targetSection}"))`);

        if (sectionElement) {
            setTimeout(() => {
                sectionElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                console.log(`[Auto-Navigation] Scrolled to ${targetSection}`);
            }, 500); // Small delay to let AI response render first
        } else {
            console.log(`[Auto-Navigation] Section element not found for ${targetSection}`);
        }
    }
}
