/**
 * Element Finder
 * Intelligent element discovery using page context and semantic matching
 */

import { extractTextContent } from './domParser.js';

/**
 * Find element by semantic description using page context
 * @param {string} description - What to find (e.g., "Pro plan card", "pricing section")
 * @param {Object} pageContext - Extracted page context
 * @returns {Element|null} Found element or null
 */
export function findElementByDescription(description, pageContext = {}) {
    const normalized = description.toLowerCase().trim();

    // Strategy 1: Context-first search
    const contextResult = searchInContext(normalized, pageContext);
    if (contextResult) return contextResult;

    // Strategy 2: Semantic matching
    const semanticResult = semanticSearch(normalized);
    if (semanticResult) return semanticResult;

    // Strategy 3: Fallback DOM search
    const domResult = fallbackDOMSearch(normalized);
    if (domResult) return domResult;

    return null;
}

/**
 * Find multiple elements for comparison
 * @param {Array<string>} descriptions - Array of descriptions
 * @param {Object} pageContext - Extracted page context
 * @returns {Array<Element>} Array of found elements
 */
export function findElementsForComparison(descriptions, pageContext = {}) {
    return descriptions
        .map(desc => findElementByDescription(desc, pageContext))
        .filter(el => el !== null);
}

/**
 * Search for element in extracted page context
 * @param {string} normalized - Normalized description
 * @param {Object} pageContext - Extracted page context
 * @returns {Element|null} Found element or null
 */
function searchInContext(normalized, pageContext) {
    // Search in pricing
    if (pageContext.pricing && pageContext.pricing.length > 0) {
        for (const plan of pageContext.pricing) {
            const planName = plan.name.toLowerCase();
            // Check for exact match or partial match
            if (normalized.includes(planName) || planName.includes(normalized)) {
                return plan.element;
            }
            // Check for word-level match (e.g., "starter" matches "Starter Plan")
            const planWords = planName.split(' ');
            const queryWords = normalized.split(' ');
            for (const planWord of planWords) {
                for (const queryWord of queryWords) {
                    if (planWord === queryWord && queryWord.length > 2) {
                        return plan.element;
                    }
                }
            }
        }
    }

    // Search in features
    if (pageContext.features && pageContext.features.length > 0) {
        for (const feature of pageContext.features) {
            const featureName = feature.name.toLowerCase();
            if (normalized.includes(featureName) || featureName.includes(normalized)) {
                return feature.element;
            }
        }
    }

    // Search in products
    if (pageContext.products && pageContext.products.length > 0) {
        for (const product of pageContext.products) {
            const productName = product.name.toLowerCase();
            if (normalized.includes(productName) || productName.includes(normalized)) {
                return product.element;
            }
        }
    }

    // Search in CTAs
    if (pageContext.ctas && pageContext.ctas.length > 0) {
        for (const cta of pageContext.ctas) {
            const ctaText = cta.text.toLowerCase();
            if (normalized.includes(ctaText) || ctaText.includes(normalized)) {
                return cta.element;
            }
        }
    }

    return null;
}

/**
 * Semantic search using text similarity
 * @param {string} normalized - Normalized description
 * @returns {Element|null} Found element or null
 */
function semanticSearch(normalized) {
    const allElements = document.querySelectorAll('section, div[class*="section"], div[id*="section"], article, main');
    let bestMatch = null;
    let bestScore = 0;

    allElements.forEach(element => {
        const text = extractTextContent(element).toLowerCase();
        const score = calculateSimilarity(normalized, text);

        if (score > bestScore && score > 0.3) {
            bestScore = score;
            bestMatch = element;
        }
    });

    return bestMatch;
}

/**
 * Fallback DOM search using various selectors
 * @param {string} normalized - Normalized description
 * @returns {Element|null} Found element or null
 */
function fallbackDOMSearch(normalized) {
    // Try ID-based search
    const words = normalized.split(' ');
    for (const word of words) {
        const byId = document.getElementById(word);
        if (byId) return byId;

        const byIdContains = document.querySelector(`[id*="${word}"]`);
        if (byIdContains) return byIdContains;
    }

    // Try class-based search
    for (const word of words) {
        const byClass = document.querySelector(`[class*="${word}"]`);
        if (byClass) return byClass;
    }

    // Try aria-label search
    const byAriaLabel = document.querySelector(`[aria-label*="${normalized}"]`);
    if (byAriaLabel) return byAriaLabel;

    // Try data attribute search
    const byDataAttr = document.querySelector(`[data-section*="${normalized}"]`);
    if (byDataAttr) return byDataAttr;

    return null;
}

/**
 * Calculate text similarity score
 * @param {string} query - Search query
 * @param {string} text - Text to compare against
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(query, text) {
    const queryWords = query.split(' ').filter(w => w.length > 2);
    let matches = 0;

    queryWords.forEach(word => {
        if (text.includes(word)) {
            matches++;
        }
    });

    return queryWords.length > 0 ? matches / queryWords.length : 0;
}

/**
 * Find section by type (pricing, features, etc.)
 * @param {string} sectionType - Type of section to find
 * @param {Object} pageContext - Extracted page context
 * @returns {Element|null} Found section or null
 */
export function findSectionByType(sectionType, pageContext = {}) {
    const sectionMap = {
        pricing: ['pricing', 'plans', 'cost'],
        features: ['features', 'capabilities', 'benefits'],
        signup: ['signup', 'register', 'join'],
        contact: ['contact', 'support', 'help'],
        about: ['about', 'team', 'company'],
        faq: ['faq', 'questions', 'help']
    };

    const keywords = sectionMap[sectionType] || [sectionType];

    for (const keyword of keywords) {
        const element = findElementByDescription(keyword, pageContext);
        if (element) return element;
    }

    return null;
}

/**
 * Get parent container of an element (useful for scrolling)
 * @param {Element} element - Element to find parent for
 * @returns {Element} Parent container
 */
export function getScrollableParent(element) {
    if (!element) return null;

    // Check if element itself is scrollable
    const style = window.getComputedStyle(element);
    const isScrollable = style.overflow === 'auto' || style.overflow === 'scroll';

    if (isScrollable) return element;

    // Find closest section or main container
    const section = element.closest('section, main, article, div[class*="section"]');
    if (section) return section;

    return element;
}

/**
 * Find elements within proximity of a target element
 * @param {Element} targetElement - Target element
 * @param {number} maxDistance - Maximum distance in pixels
 * @returns {Array<Element>} Nearby elements
 */
export function findNearbyElements(targetElement, maxDistance = 200) {
    if (!targetElement) return [];

    const targetRect = targetElement.getBoundingClientRect();
    const allElements = document.querySelectorAll('div, section, article, button, a');
    const nearby = [];

    allElements.forEach(element => {
        if (element === targetElement) return;

        const rect = element.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(rect.left - targetRect.left, 2) +
            Math.pow(rect.top - targetRect.top, 2)
        );

        if (distance <= maxDistance) {
            nearby.push(element);
        }
    });

    return nearby;
}

/**
 * Check if element is currently visible in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} True if visible
 */
export function isElementInViewport(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
