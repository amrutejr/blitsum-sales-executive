/**
 * Intent Parser
 * Parses natural language input to extract navigation intent
 */

/**
 * Navigation intent types
 */
export const IntentType = {
    NAVIGATE: 'navigate',
    COMPARE: 'compare',
    HIGHLIGHT: 'highlight',
    READ: 'read',
    CLICK: 'click',
    UNKNOWN: 'unknown'
};

/**
 * Target entity types
 */
export const TargetType = {
    PRICING: 'pricing',
    FEATURES: 'features',
    SIGNUP: 'signup',
    CONTACT: 'contact',
    ABOUT: 'about',
    FAQ: 'faq',
    PRODUCT: 'product',
    CTA: 'cta',
    UNKNOWN: 'unknown'
};

/**
 * Navigation keywords for intent classification
 */
const NAVIGATION_KEYWORDS = {
    navigate: ['show', 'display', 'take me to', 'go to', 'navigate to', 'scroll to', 'see', 'view', 'find', 'locate', 'where is', 'bring me to'],
    compare: ['compare', 'difference between', 'versus', 'vs', 'what\'s better', 'which is better'],
    highlight: ['highlight', 'point out', 'show me', 'mark', 'indicate'],
    read: ['read', 'tell me about', 'what is', 'explain', 'describe'],
    click: ['click', 'press', 'tap', 'select', 'choose', 'get started', 'sign up', 'join']
};

/**
 * Target entity keywords
 */
const TARGET_KEYWORDS = {
    pricing: ['pricing', 'price', 'cost', 'plan', 'plans', 'subscription', 'how much', 'payment', 'starter', 'pro', 'enterprise', 'basic', 'premium', 'free'],
    features: ['feature', 'features', 'capability', 'capabilities', 'benefit', 'benefits', 'what can', 'what does'],
    signup: ['signup', 'sign up', 'register', 'join', 'get started', 'start', 'create account'],
    contact: ['contact', 'support', 'help', 'reach', 'email', 'phone', 'talk to'],
    about: ['about', 'who', 'team', 'company', 'story', 'mission'],
    faq: ['faq', 'question', 'questions', 'help', 'how to'],
    product: ['product', 'service', 'offering', 'solution'],
    cta: ['button', 'cta', 'call to action']
};

/**
 * Parse user input to extract navigation intent
 * @param {string} userInput - Natural language input
 * @param {Object} pageContext - Extracted page context
 * @returns {Object} Parsed intent with action plan
 */
export function parseNavigationIntent(userInput, pageContext = {}) {
    const normalized = userInput.toLowerCase().trim();

    // Extract intent type
    const intentType = classifyIntent(normalized);

    // Extract target type
    const targetType = classifyTarget(normalized);

    // Extract specific entities (e.g., "Pro plan", "Starter")
    const entities = extractEntities(normalized, pageContext);

    // Calculate confidence score
    const confidence = calculateConfidence(intentType, targetType, entities);

    return {
        intent: intentType,
        target: targetType,
        entities,
        confidence,
        originalInput: userInput
    };
}

/**
 * Classify the intent type from user input
 * @param {string} normalized - Normalized user input
 * @returns {string} Intent type
 */
function classifyIntent(normalized) {
    let maxScore = 0;
    let detectedIntent = IntentType.UNKNOWN;

    for (const [intent, keywords] of Object.entries(NAVIGATION_KEYWORDS)) {
        const score = keywords.reduce((acc, keyword) => {
            // Use word boundary matching to prevent partial matches
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return acc + (regex.test(normalized) ? 1 : 0);
        }, 0);

        if (score > maxScore) {
            maxScore = score;
            detectedIntent = intent;
        }
    }

    // Default to navigate if no specific intent detected but has target
    if (detectedIntent === IntentType.UNKNOWN) {
        for (const keywords of Object.values(TARGET_KEYWORDS)) {
            if (keywords.some(kw => {
                const regex = new RegExp(`\\b${kw}\\b`, 'i');
                return regex.test(normalized);
            })) {
                return IntentType.NAVIGATE;
            }
        }
    }

    return detectedIntent;
}

/**
 * Classify the target type from user input
 * @param {string} normalized - Normalized user input
 * @returns {string} Target type
 */
function classifyTarget(normalized) {
    let maxScore = 0;
    let detectedTarget = TargetType.UNKNOWN;

    for (const [target, keywords] of Object.entries(TARGET_KEYWORDS)) {
        const score = keywords.reduce((acc, keyword) => {
            // Use word boundary matching to prevent partial matches
            // Exception: allow partial match for multi-word phrases
            if (keyword.includes(' ')) {
                return acc + (normalized.includes(keyword) ? 1 : 0);
            }
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return acc + (regex.test(normalized) ? 1 : 0);
        }, 0);

        if (score > maxScore) {
            maxScore = score;
            detectedTarget = target;
        }
    }

    return detectedTarget;
}

/**
 * Extract specific entities from user input
 * @param {string} normalized - Normalized user input
 * @param {Object} pageContext - Extracted page context
 * @returns {Array<string>} Extracted entities
 */
function extractEntities(normalized, pageContext) {
    const entities = [];

    // Extract pricing plan names
    if (pageContext.pricing && pageContext.pricing.length > 0) {
        pageContext.pricing.forEach(plan => {
            const planName = plan.name.toLowerCase();
            if (normalized.includes(planName)) {
                entities.push(plan.name);
            }
        });
    }

    // Extract product names
    if (pageContext.products && pageContext.products.length > 0) {
        pageContext.products.forEach(product => {
            const productName = product.name.toLowerCase();
            if (normalized.includes(productName)) {
                entities.push(product.name);
            }
        });
    }

    // Extract feature names
    if (pageContext.features && pageContext.features.length > 0) {
        pageContext.features.forEach(feature => {
            const featureName = feature.name.toLowerCase();
            if (normalized.includes(featureName)) {
                entities.push(feature.name);
            }
        });
    }

    // Common plan names (fallback)
    const commonPlans = ['starter', 'pro', 'professional', 'enterprise', 'business', 'free', 'premium'];
    commonPlans.forEach(plan => {
        if (normalized.includes(plan) && !entities.includes(plan)) {
            entities.push(plan);
        }
    });

    return entities;
}

/**
 * Calculate confidence score for the parsed intent
 * @param {string} intentType - Detected intent type
 * @param {string} targetType - Detected target type
 * @param {Array<string>} entities - Extracted entities
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(intentType, targetType, entities) {
    let score = 0;

    // Base score for detected intent
    if (intentType !== IntentType.UNKNOWN) score += 0.4;

    // Score for detected target
    if (targetType !== TargetType.UNKNOWN) score += 0.3;

    // Score for extracted entities
    if (entities.length > 0) score += 0.3;

    return Math.min(score, 1.0);
}

/**
 * Check if input is a navigation request
 * @param {string} userInput - User input
 * @returns {boolean} True if navigation request
 */
export function isNavigationRequest(userInput) {
    const intent = parseNavigationIntent(userInput);
    return intent.confidence >= 0.5 && intent.intent !== IntentType.UNKNOWN;
}
