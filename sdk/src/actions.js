/**
 * Action System
 * Provides functions for the AI agent to interact with the page
 */

import { findElementByDescription, findElementsForComparison, getScrollableParent, isElementInViewport } from './utils/elementFinder.js';
import { extractTextContent } from './utils/domParser.js';

/**
 * Scroll to a specific section smoothly
 * @param {string} sectionId - ID of the section to scroll to (hero, features, pricing)
 * @returns {Object} Result of the action
 */
export function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return { success: true, section: sectionId };
    }
    return { success: false, error: 'Section not found' };
}

/**
 * Highlight a specific element temporarily to draw attention
 * @param {string} selector - CSS selector for the element to highlight
 * @param {number} duration - How long to highlight in milliseconds
 * @returns {Object} Result of the action
 */
export function highlightElement(selector, duration = 2000) {
    const element = document.querySelector(selector);
    if (element) {
        const originalBoxShadow = element.style.boxShadow;
        const originalTransform = element.style.transform;

        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 0 30px rgba(45, 212, 191, 0.6)';
        element.style.transform = 'scale(1.02)';

        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
            element.style.transform = originalTransform;
        }, duration);

        return { success: true };
    }
    return { success: false, error: 'Element not found' };
}

/**
 * Pulse a CTA button to draw attention
 * @param {string} selector - CSS selector for the button
 * @returns {Object} Result of the action
 */
export function pulseCTA(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('pulse-animation');
        setTimeout(() => button.classList.remove('pulse-animation'), 3000);
        return { success: true };
    }
    return { success: false, error: 'Button not found' };
}

// ========== NEW AGENTIC NAVIGATION ACTIONS ==========

/**
 * Navigate to element by description (intelligent search)
 * @param {string} description - Description of element to find
 * @param {Object} pageContext - Extracted page context
 * @param {boolean} smooth - Use smooth scrolling
 * @returns {Object} Result of the action
 */
export function navigateToElement(description, pageContext = {}, smooth = true) {
    const element = findElementByDescription(description, pageContext);

    if (element) {
        const scrollTarget = getScrollableParent(element);
        scrollTarget.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'center'
        });

        return {
            success: true,
            element,
            description,
            isVisible: isElementInViewport(element)
        };
    }

    return {
        success: false,
        error: `Could not find element matching: ${description}`
    };
}

/**
 * Highlight multiple elements for comparison
 * @param {Array<string>} descriptions - Array of element descriptions
 * @param {Object} pageContext - Extracted page context
 * @param {number} duration - How long to highlight in milliseconds
 * @returns {Object} Result of the action
 */
export function compareElements(descriptions, pageContext = {}, duration = 3000) {
    console.log('[compareElements] Looking for:', descriptions);
    console.log('[compareElements] Page context pricing:', pageContext.pricing?.map(p => p.name));

    const elements = findElementsForComparison(descriptions, pageContext);

    console.log('[compareElements] Found elements:', elements.length);

    if (elements.length === 0) {
        return {
            success: false,
            error: 'No elements found for comparison',
            descriptions
        };
    }

    // Store original styles
    const originalStyles = elements.map(el => ({
        boxShadow: el.style.boxShadow,
        transform: el.style.transform,
        outline: el.style.outline,
        transition: el.style.transition
    }));

    // Apply comparison highlighting
    elements.forEach((element, index) => {
        const colors = [
            'rgba(45, 212, 191, 0.8)',  // Teal
            'rgba(139, 92, 246, 0.8)',  // Purple
            'rgba(251, 146, 60, 0.8)'   // Orange
        ];

        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = `0 0 40px ${colors[index % colors.length]}`;
        element.style.transform = 'scale(1.03)';
        element.style.outline = `3px solid ${colors[index % colors.length]}`;

        console.log(`[compareElements] Highlighted element ${index + 1}:`, element.className);
    });

    // Restore original styles after duration
    setTimeout(() => {
        elements.forEach((element, index) => {
            element.style.boxShadow = originalStyles[index].boxShadow;
            element.style.transform = originalStyles[index].transform;
            element.style.outline = originalStyles[index].outline;
            element.style.transition = originalStyles[index].transition;
        });
        console.log('[compareElements] Restored original styles');
    }, duration);

    return {
        success: true,
        elementsFound: elements.length,
        descriptions
    };
}

/**
 * Read element content (extract text for voice mode)
 * @param {string} description - Description of element to read
 * @param {Object} pageContext - Extracted page context
 * @returns {Object} Result with extracted content
 */
export function readElementContent(description, pageContext = {}) {
    const element = findElementByDescription(description, pageContext);

    if (element) {
        const content = extractTextContent(element);

        return {
            success: true,
            content,
            element,
            description
        };
    }

    return {
        success: false,
        error: `Could not find element matching: ${description}`
    };
}

/**
 * Click element (with safety checks)
 * @param {string} description - Description of element to click
 * @param {Object} pageContext - Extracted page context
 * @returns {Object} Result of the action
 */
export function clickElement(description, pageContext = {}) {
    const element = findElementByDescription(description, pageContext);

    if (element) {
        // Safety check: only click interactive elements
        const isInteractive = element.tagName === 'BUTTON' ||
            element.tagName === 'A' ||
            element.getAttribute('role') === 'button' ||
            element.onclick !== null;

        if (!isInteractive) {
            return {
                success: false,
                error: 'Element is not clickable'
            };
        }

        // Scroll to element first
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Click after scroll animation
        setTimeout(() => {
            element.click();
        }, 500);

        return {
            success: true,
            element,
            description
        };
    }

    return {
        success: false,
        error: `Could not find element matching: ${description}`
    };
}

/**
 * Focus/zoom on element (visual emphasis)
 * @param {string} description - Description of element to focus
 * @param {Object} pageContext - Extracted page context
 * @param {number} duration - How long to focus in milliseconds
 * @returns {Object} Result of the action
 */
export function focusElement(description, pageContext = {}, duration = 2500) {
    const element = findElementByDescription(description, pageContext);

    if (element) {
        // Scroll to element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Store original styles
        const originalStyles = {
            boxShadow: element.style.boxShadow,
            transform: element.style.transform,
            zIndex: element.style.zIndex,
            position: element.style.position
        };

        // Apply focus effect
        setTimeout(() => {
            element.style.transition = 'all 0.4s ease';
            element.style.boxShadow = '0 0 60px rgba(45, 212, 191, 0.9), 0 0 100px rgba(45, 212, 191, 0.5)';
            element.style.transform = 'scale(1.05)';
            element.style.zIndex = '9999';
            element.style.position = 'relative';
        }, 600);

        // Restore original styles
        setTimeout(() => {
            element.style.boxShadow = originalStyles.boxShadow;
            element.style.transform = originalStyles.transform;
            element.style.zIndex = originalStyles.zIndex;
            element.style.position = originalStyles.position;
        }, duration + 600);

        return {
            success: true,
            element,
            description
        };
    }

    return {
        success: false,
        error: `Could not find element matching: ${description}`
    };
}

