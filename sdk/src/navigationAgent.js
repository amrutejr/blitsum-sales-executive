/**
 * Navigation Agent
 * Intelligent agent that autonomously navigates websites based on user intent
 */

import { parseNavigationIntent, isNavigationRequest } from './utils/intentParser.js';
import { findElementByDescription, findSectionByType } from './utils/elementFinder.js';
import {
    navigateToElement,
    compareElements,
    readElementContent,
    clickElement,
    focusElement
} from './actions.js';

export class NavigationAgent {
    constructor(pageContext = {}) {
        this.pageContext = pageContext;
        this.actionQueue = [];
        this.currentAction = null;
        this.history = [];
    }

    /**
     * Update page context (call when page changes)
     * @param {Object} newContext - Updated page context
     */
    updateContext(newContext) {
        this.pageContext = newContext;
    }

    /**
     * Process navigation request
     * @param {string} userInput - User's navigation request
     * @returns {Promise<Object>} Navigation result
     */
    async navigate(userInput) {
        console.log('[NavigationAgent] Processing:', userInput);

        // 1. Parse intent
        const intent = parseNavigationIntent(userInput, this.pageContext);
        console.log('[NavigationAgent] Intent:', intent);

        // Check confidence threshold
        if (intent.confidence < 0.5) {
            return {
                success: false,
                error: 'Could not understand navigation request',
                suggestion: 'Try being more specific about what you want to see'
            };
        }

        // 2. Plan actions
        const actionPlan = this.planActions(intent);
        console.log('[NavigationAgent] Action plan:', actionPlan);

        if (actionPlan.length === 0) {
            return {
                success: false,
                error: 'Could not create action plan',
                intent
            };
        }

        // 3. Execute actions sequentially
        const result = await this.executeActionPlan(actionPlan);

        // 4. Generate response
        const response = this.generateResponse(intent, result);

        // 5. Add to history
        this.history.push({
            userInput,
            intent,
            actionPlan,
            result,
            response,
            timestamp: Date.now()
        });

        return response;
    }

    /**
     * Plan multi-step actions based on intent
     * @param {Object} intent - Parsed intent
     * @returns {Array<Object>} Array of actions to execute
     */
    planActions(intent) {
        const actions = [];

        switch (intent.intent) {
            case 'navigate':
                actions.push({
                    type: 'navigate',
                    target: intent.target,
                    entities: intent.entities
                });
                break;

            case 'compare':
                if (intent.entities.length >= 2) {
                    // Only navigate if we have a known target
                    if (intent.target !== 'unknown') {
                        actions.push({
                            type: 'navigate',
                            target: intent.target
                        });
                    }
                    actions.push({
                        type: 'compare',
                        entities: intent.entities
                    });
                } else {
                    // Not enough entities to compare - navigate if target is known
                    if (intent.target !== 'unknown') {
                        actions.push({
                            type: 'navigate',
                            target: intent.target
                        });
                    }
                }
                break;

            case 'highlight':
                // Only navigate if we have a known target
                if (intent.target !== 'unknown') {
                    actions.push({
                        type: 'navigate',
                        target: intent.target
                    });
                }
                actions.push({
                    type: 'focus',
                    target: intent.entities[0] || intent.target
                });
                break;

            case 'read':
                // Only navigate if we have a known target
                if (intent.target !== 'unknown') {
                    actions.push({
                        type: 'navigate',
                        target: intent.target
                    });
                }
                actions.push({
                    type: 'read',
                    target: intent.entities[0] || intent.target
                });
                break;

            case 'click':
                actions.push({
                    type: 'click',
                    target: intent.entities[0] || intent.target
                });
                break;

            default:
                // Unknown intent - try basic navigation
                if (intent.target !== 'unknown') {
                    actions.push({
                        type: 'navigate',
                        target: intent.target
                    });
                }
        }

        return actions;
    }

    /**
     * Execute action plan with visual feedback
     * @param {Array<Object>} actionPlan - Array of actions
     * @returns {Promise<Object>} Execution result
     */
    async executeActionPlan(actionPlan) {
        const results = [];

        for (const action of actionPlan) {
            this.currentAction = action;

            try {
                const result = await this.executeAction(action);
                results.push(result);

                // Wait between actions for smooth UX
                if (actionPlan.length > 1) {
                    await this.delay(400);
                }
            } catch (error) {
                console.error('[NavigationAgent] Action failed:', error);
                results.push({
                    success: false,
                    error: error.message,
                    action
                });
            }
        }

        this.currentAction = null;

        return {
            success: results.every(r => r.success),
            results,
            totalActions: actionPlan.length
        };
    }

    /**
     * Execute a single action
     * @param {Object} action - Action to execute
     * @returns {Promise<Object>} Action result
     */
    async executeAction(action) {
        const logDetails = action.type === 'compare'
            ? `${action.type} [${action.entities?.join(', ')}]`
            : `${action.type} ${action.target || ''}`;
        console.log('[NavigationAgent] Executing:', logDetails);

        switch (action.type) {
            case 'navigate':
                return this.executeNavigate(action);

            case 'compare':
                return this.executeCompare(action);

            case 'read':
                return this.executeRead(action);

            case 'click':
                return this.executeClick(action);

            case 'focus':
                return this.executeFocus(action);

            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    /**
     * Execute navigate action
     */
    executeNavigate(action) {
        // Try to find section by type first
        const section = findSectionByType(action.target, this.pageContext);

        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return {
                success: true,
                action: 'navigate',
                target: action.target
            };
        }

        // Fallback to navigateToElement
        const targetDescription = action.entities && action.entities.length > 0
            ? action.entities[0]
            : action.target;

        return navigateToElement(targetDescription, this.pageContext);
    }

    /**
     * Execute compare action
     */
    executeCompare(action) {
        console.log('[NavigationAgent] executeCompare called with entities:', action.entities);
        if (!action.entities || action.entities.length === 0) {
            return {
                success: false,
                error: 'No entities provided for comparison'
            };
        }
        return compareElements(action.entities, this.pageContext);
    }

    /**
     * Execute read action
     */
    executeRead(action) {
        return readElementContent(action.target, this.pageContext);
    }

    /**
     * Execute click action
     */
    executeClick(action) {
        return clickElement(action.target, this.pageContext);
    }

    /**
     * Execute focus action
     */
    executeFocus(action) {
        return focusElement(action.target, this.pageContext);
    }

    /**
     * Generate user-facing response
     * @param {Object} intent - Original intent
     * @param {Object} result - Execution result
     * @returns {Object} Response object
     */
    generateResponse(intent, result) {
        if (!result.success) {
            return {
                success: false,
                response: this.generateErrorResponse(intent, result),
                intent,
                result
            };
        }

        // Generate success response based on intent
        let response = '';

        switch (intent.intent) {
            case 'navigate':
                response = this.generateNavigateResponse(intent, result);
                break;

            case 'compare':
                response = this.generateCompareResponse(intent, result);
                break;

            case 'read':
                response = this.generateReadResponse(intent, result);
                break;

            case 'click':
                response = `I've clicked on ${intent.entities[0] || intent.target} for you.`;
                break;

            case 'highlight':
                response = `Here's the ${intent.entities[0] || intent.target}.`;
                break;

            default:
                response = `I've navigated to ${intent.target}.`;
        }

        return {
            success: true,
            response,
            intent,
            result
        };
    }

    /**
     * Generate navigation response
     */
    generateNavigateResponse(intent, result) {
        const templates = {
            pricing: "Here's our pricing information.",
            features: "Here are our features.",
            signup: "Here's where you can sign up.",
            contact: "Here's how to contact us.",
            about: "Here's information about us.",
            faq: "Here are our frequently asked questions."
        };

        return templates[intent.target] || `Here's the ${intent.target} section.`;
    }

    /**
     * Generate comparison response
     */
    generateCompareResponse(intent, result) {
        if (intent.entities.length >= 2) {
            return `Comparing ${intent.entities.join(' and ')}.`;
        }
        return `Here's the comparison.`;
    }

    /**
     * Generate read response (includes content)
     */
    generateReadResponse(intent, result) {
        const readResult = result.results.find(r => r.content);
        if (readResult && readResult.content) {
            // Summarize content for voice (first 200 chars)
            const summary = readResult.content.substring(0, 200);
            return summary + (readResult.content.length > 200 ? '...' : '');
        }
        return `Here's information about ${intent.target}.`;
    }

    /**
     * Generate error response with helpful suggestions
     */
    generateErrorResponse(intent, result) {
        const failedAction = result.results.find(r => !r.success);

        if (failedAction && failedAction.error) {
            // Provide helpful alternatives
            const available = this.listAvailableElements();
            return `I couldn't find "${intent.target}". ${available}`;
        }

        return `I had trouble navigating to "${intent.target}". Could you try being more specific?`;
    }

    /**
     * List available elements from page context
     */
    listAvailableElements() {
        const available = [];

        if (this.pageContext.pricing && this.pageContext.pricing.length > 0) {
            available.push('pricing');
        }
        if (this.pageContext.features && this.pageContext.features.length > 0) {
            available.push('features');
        }
        if (this.pageContext.ctas && this.pageContext.ctas.length > 0) {
            available.push('signup options');
        }

        if (available.length > 0) {
            return `I can show you: ${available.join(', ')}.`;
        }

        return 'Try asking about what you see on the page.';
    }

    /**
     * Utility: delay execution
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get navigation history
     */
    getHistory() {
        return this.history;
    }

    /**
     * Clear navigation history
     */
    clearHistory() {
        this.history = [];
    }
}
