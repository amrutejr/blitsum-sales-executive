/**
 * Content Classifier Utilities
 * Heuristics for identifying and classifying different types of content
 */

import { extractTextContent } from './domParser.js';

/**
 * Safely get className as a string (handles SVG elements)
 * @param {Element} element - DOM element
 * @returns {string} className as string
 */
function getClassName(element) {
    if (!element || !element.className) return '';
    // SVG elements have className as SVGAnimatedString
    if (typeof element.className === 'object' && element.className.baseVal !== undefined) {
        return element.className.baseVal;
    }
    return element.className;
}

/**
 * Detect if an element contains pricing information
 * @param {Element} element - DOM element
 * @returns {boolean} True if element appears to be pricing-related
 */
export function isPricingElement(element) {
    if (!element) return false;

    const text = extractTextContent(element).toLowerCase();
    const className = getClassName(element).toLowerCase();
    const id = (element.id || '').toLowerCase();

    // Check for pricing keywords
    const pricingKeywords = ['price', 'pricing', 'plan', 'cost', 'subscription', 'tier', 'package'];
    const hasPricingKeyword = pricingKeywords.some(keyword =>
        text.includes(keyword) || className.includes(keyword) || id.includes(keyword)
    );

    // Check for currency symbols and price patterns
    const currencyPattern = /[$€£¥₹]\s*\d+|(\d+)\s*(usd|eur|gbp|inr|dollars?|euros?)/i;
    const hasCurrency = currencyPattern.test(text);

    // Check for price-like numbers
    const pricePattern = /\$\d+|\d+\/mo|\d+\/month|\d+\s*per\s*month/i;
    const hasPrice = pricePattern.test(text);

    // Strong indicator: has both pricing keyword and currency/price
    if (hasPricingKeyword && (hasCurrency || hasPrice)) {
        return true;
    }

    // Check for common pricing element types
    const pricingTags = ['TABLE', 'DIV', 'SECTION'];
    if (pricingTags.includes(element.tagName)) {
        // Look for multiple price indicators in children
        const priceElements = element.querySelectorAll('*');
        let priceCount = 0;
        for (const child of priceElements) {
            const childText = extractTextContent(child);
            if (currencyPattern.test(childText) || pricePattern.test(childText)) {
                priceCount++;
            }
        }
        // If we find 2+ prices, likely a pricing table
        if (priceCount >= 2) {
            return true;
        }
    }

    return false;
}

/**
 * Detect if an element is a feature list
 * @param {Element} element - DOM element
 * @returns {boolean} True if element appears to be a feature list
 */
export function isFeatureList(element) {
    if (!element) return false;

    const text = extractTextContent(element).toLowerCase();
    const className = getClassName(element).toLowerCase();
    const id = (element.id || '').toLowerCase();

    // Check for feature keywords
    const featureKeywords = ['feature', 'benefit', 'capability', 'offering', 'includes', 'what you get'];
    const hasFeatureKeyword = featureKeywords.some(keyword =>
        text.includes(keyword) || className.includes(keyword) || id.includes(keyword)
    );

    // Check for list structures
    const isList = element.tagName === 'UL' || element.tagName === 'OL';
    const hasListItems = element.querySelectorAll('li').length >= 3;

    // Check for grid/card layouts (common for features)
    const isGrid = className.includes('grid') || className.includes('feature') || className.includes('bento');

    // Check for checkmark/icon patterns (common in feature lists)
    const hasCheckmarks = element.innerHTML.includes('✓') ||
        element.innerHTML.includes('✔') ||
        element.querySelector('svg') !== null;

    // Strong indicators
    if (hasFeatureKeyword && (isList || isGrid)) {
        return true;
    }

    if ((isList || isGrid) && hasListItems && hasCheckmarks) {
        return true;
    }

    // Check for multiple child elements with similar structure (feature cards)
    const children = Array.from(element.children);
    if (children.length >= 3) {
        const hasConsistentStructure = children.every(child => {
            const hasHeading = child.querySelector('h1, h2, h3, h4, h5, h6') !== null;
            const hasText = extractTextContent(child).length > 20;
            return hasHeading && hasText;
        });

        if (hasConsistentStructure && (hasFeatureKeyword || isGrid)) {
            return true;
        }
    }

    return false;
}

/**
 * Detect if an element is an FAQ section
 * @param {Element} element - DOM element
 * @returns {boolean} True if element appears to be FAQ content
 */
export function isFAQ(element) {
    if (!element) return false;

    const text = extractTextContent(element).toLowerCase();
    const className = getClassName(element).toLowerCase();
    const id = (element.id || '').toLowerCase();

    // Check for FAQ keywords
    const faqKeywords = ['faq', 'frequently asked', 'questions', 'q&a', 'q & a'];
    const hasFAQKeyword = faqKeywords.some(keyword =>
        text.includes(keyword) || className.includes(keyword) || id.includes(keyword)
    );

    // Check for question patterns
    const questionPattern = /\b(what|how|why|when|where|who|can|is|are|do|does)\b.*\?/i;
    const questions = element.querySelectorAll('*');
    let questionCount = 0;
    for (const child of questions) {
        const childText = extractTextContent(child);
        if (questionPattern.test(childText)) {
            questionCount++;
        }
    }

    // Strong indicator: FAQ keyword + multiple questions
    if (hasFAQKeyword && questionCount >= 2) {
        return true;
    }

    // Check for accordion/collapsible structure (common for FAQs)
    const hasAccordion = className.includes('accordion') ||
        className.includes('collapse') ||
        element.querySelector('[role="button"]') !== null;

    if (hasAccordion && questionCount >= 2) {
        return true;
    }

    // Check for definition list (dt/dd pattern)
    if (element.tagName === 'DL') {
        const dtCount = element.querySelectorAll('dt').length;
        if (dtCount >= 2) {
            return true;
        }
    }

    return false;
}

/**
 * Detect if an element is a product/service card
 * @param {Element} element - DOM element
 * @returns {boolean} True if element appears to be a product card
 */
export function isProductCard(element) {
    if (!element) return false;

    const text = extractTextContent(element);
    const className = getClassName(element).toLowerCase();

    // Check for card-like class names
    const cardKeywords = ['card', 'product', 'item', 'service', 'offering'];
    const hasCardKeyword = cardKeywords.some(keyword => className.includes(keyword));

    // Check for typical product card structure
    const hasImage = element.querySelector('img') !== null;
    const hasHeading = element.querySelector('h1, h2, h3, h4, h5, h6') !== null;
    const hasButton = element.querySelector('button, a.btn, a.button, [role="button"]') !== null;

    // Product cards typically have: image + heading + description + CTA
    if (hasCardKeyword && hasHeading && (hasImage || hasButton)) {
        return true;
    }

    // Check for price indicator (common in product cards)
    const pricePattern = /[$€£¥₹]\s*\d+/;
    const hasPrice = pricePattern.test(text);

    if (hasHeading && hasPrice && hasButton) {
        return true;
    }

    // Check for typical product card size (not too small, not too large)
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height;
    const isReasonableSize = area > 10000 && area < 500000; // Rough heuristic

    if (isReasonableSize && hasHeading && hasImage && text.length > 50 && text.length < 500) {
        return true;
    }

    return false;
}

/**
 * Detect if an element is a Call-to-Action (CTA)
 * @param {Element} element - DOM element
 * @returns {boolean} True if element appears to be a CTA
 */
export function isCTA(element) {
    if (!element) return false;

    const tagName = element.tagName;
    const text = extractTextContent(element).toLowerCase();
    const className = getClassName(element).toLowerCase();
    const role = element.getAttribute('role');

    // Check if it's a button or link
    const isButton = tagName === 'BUTTON' || tagName === 'A' || role === 'button';
    if (!isButton) return false;

    // Check for CTA keywords
    const ctaKeywords = [
        'get started', 'sign up', 'try', 'buy now', 'purchase', 'subscribe',
        'join', 'register', 'download', 'learn more', 'contact', 'demo',
        'free trial', 'start free', 'get access', 'book', 'schedule'
    ];

    const hasCTAKeyword = ctaKeywords.some(keyword => text.includes(keyword));

    // Check for CTA class names
    const ctaClasses = ['cta', 'btn-primary', 'button-primary', 'call-to-action'];
    const hasCTAClass = ctaClasses.some(cls => className.includes(cls));

    // Strong indicators
    if (hasCTAKeyword || hasCTAClass) {
        return true;
    }

    // Check for prominent styling (large, colorful buttons)
    const style = window.getComputedStyle(element);
    const hasProminentStyle =
        parseInt(style.fontSize) > 14 ||
        style.fontWeight === 'bold' ||
        style.fontWeight >= 600;

    if (isButton && hasProminentStyle && text.length > 3 && text.length < 50) {
        return true;
    }

    return false;
}

/**
 * Classify an element's content type
 * @param {Element} element - DOM element
 * @returns {string|null} Content type or null
 */
export function detectElementType(element) {
    if (!element) return null;

    // Check in order of specificity
    if (isCTA(element)) return 'cta';
    if (isPricingElement(element)) return 'pricing';
    if (isFeatureList(element)) return 'features';
    if (isFAQ(element)) return 'faq';
    if (isProductCard(element)) return 'product';

    return null;
}
