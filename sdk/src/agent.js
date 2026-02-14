/**
 * Agent System
 * Parses AI responses and executes actions
 */

import { scrollToSection, highlightElement, pulseCTA } from './actions.js';

/**
 * Parse AI response and execute any embedded actions
 * @param {string} aiResponse - Raw response from AI
 * @returns {string} Clean text response for display
 */
export function parseAndExecute(aiResponse) {
    const lines = aiResponse.split('\n');
    let textResponse = '';
    let action = null;

    for (const line of lines) {
        const trimmed = line.trim();
        // Check if line is a JSON action
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                action = JSON.parse(trimmed);
            } catch (e) {
                // Not valid JSON, treat as regular text
                textResponse += line + '\n';
            }
        } else {
            textResponse += line + '\n';
        }
    }

    // Execute action if present
    if (action && action.action) {
        executeAction(action);
    }

    return textResponse.trim();
}

/**
 * Execute a specific action based on type
 * @param {Object} action - Action object with type and parameters
 */
function executeAction(action) {
    console.log('Executing action:', action);

    switch (action.action) {
        case 'scroll':
            if (action.section) {
                scrollToSection(action.section);
            }
            break;

        case 'highlight':
            if (action.element) {
                highlightElement(action.element);
            }
            break;

        case 'pulse_cta':
            if (action.element) {
                pulseCTA(action.element);
            }
            break;

        default:
            console.warn('Unknown action type:', action.action);
    }
}
