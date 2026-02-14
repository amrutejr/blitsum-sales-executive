/**
 * DOM Parser Utilities
 * Core functions for parsing and extracting content from the DOM
 */

/**
 * Get all visible elements in the viewport and nearby
 * @returns {Array<Element>} Array of visible DOM elements
 */
export function getVisibleElements() {
    const elements = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node) => {
                // Skip script, style, and hidden elements
                if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'NOSCRIPT') {
                    return NodeFilter.FILTER_REJECT;
                }

                // Check if element is visible
                const style = window.getComputedStyle(node);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let node;
    while (node = walker.nextNode()) {
        elements.push(node);
    }

    return elements;
}

/**
 * Extract clean text content from an element
 * @param {Element} element - DOM element
 * @returns {string} Cleaned text content
 */
export function extractTextContent(element) {
    if (!element) return '';

    // Clone to avoid modifying original
    const clone = element.cloneNode(true);

    // Remove script and style elements
    const unwanted = clone.querySelectorAll('script, style, noscript');
    unwanted.forEach(el => el.remove());

    // Get text and clean it
    let text = clone.textContent || clone.innerText || '';

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * Find elements matching a pattern (text, class, or attribute)
 * @param {string} pattern - Pattern to search for
 * @param {Object} options - Search options
 * @returns {Array<Element>} Matching elements
 */
export function findElementsByPattern(pattern, options = {}) {
    const {
        searchText = true,
        searchClasses = true,
        searchAttributes = true,
        caseSensitive = false
    } = options;

    const results = [];
    const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
    const elements = getVisibleElements();

    for (const element of elements) {
        let matches = false;

        // Search in text content
        if (searchText) {
            const text = caseSensitive ? extractTextContent(element) : extractTextContent(element).toLowerCase();
            if (text.includes(searchPattern)) {
                matches = true;
            }
        }

        // Search in class names
        if (searchClasses && element.className) {
            const className = caseSensitive ? element.className : element.className.toLowerCase();
            if (className.includes(searchPattern)) {
                matches = true;
            }
        }

        // Search in attributes
        if (searchAttributes) {
            for (const attr of element.attributes) {
                const value = caseSensitive ? attr.value : attr.value.toLowerCase();
                if (value.includes(searchPattern)) {
                    matches = true;
                    break;
                }
            }
        }

        if (matches) {
            results.push(element);
        }
    }

    return results;
}

/**
 * Calculate relevance score for an element based on position and visibility
 * @param {Element} element - DOM element
 * @returns {number} Relevance score (0-100)
 */
export function calculateElementRelevance(element) {
    if (!element) return 0;

    let score = 50; // Base score

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Boost score if in viewport
    if (rect.top >= 0 && rect.bottom <= viewportHeight) {
        score += 30;
    }

    // Boost score if near current scroll position
    const elementTop = rect.top + scrollY;
    const distanceFromScroll = Math.abs(elementTop - scrollY);
    if (distanceFromScroll < viewportHeight) {
        score += 20 * (1 - distanceFromScroll / viewportHeight);
    }

    // Boost score based on element size (larger = more important, up to a point)
    const area = rect.width * rect.height;
    const viewportArea = window.innerWidth * viewportHeight;
    const areaRatio = Math.min(area / viewportArea, 0.5);
    score += areaRatio * 20;

    // Boost score for semantic HTML elements
    const semanticTags = ['MAIN', 'ARTICLE', 'SECTION', 'HEADER', 'H1', 'H2', 'H3'];
    if (semanticTags.includes(element.tagName)) {
        score += 10;
    }

    // Reduce score for footer and aside
    if (['FOOTER', 'ASIDE'].includes(element.tagName)) {
        score -= 20;
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Get page structure as a hierarchical outline
 * @returns {Object} Page structure with sections and headings
 */
export function getPageStructure() {
    const structure = {
        title: document.title,
        headings: [],
        sections: []
    };

    // Extract all headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        if (isElementVisible(heading)) {
            structure.headings.push({
                level: parseInt(heading.tagName[1]),
                text: extractTextContent(heading),
                id: heading.id || null
            });
        }
    });

    // Extract main sections
    const sections = document.querySelectorAll('section, article, main, [role="main"]');
    sections.forEach(section => {
        if (isElementVisible(section)) {
            const sectionData = {
                id: section.id || null,
                type: section.tagName.toLowerCase(),
                heading: null,
                textPreview: null
            };

            // Find first heading in section
            const firstHeading = section.querySelector('h1, h2, h3, h4, h5, h6');
            if (firstHeading) {
                sectionData.heading = extractTextContent(firstHeading);
            }

            // Get text preview (first 200 chars)
            const text = extractTextContent(section);
            sectionData.textPreview = text.substring(0, 200) + (text.length > 200 ? '...' : '');

            structure.sections.push(sectionData);
        }
    });

    return structure;
}

/**
 * Check if an element is visible
 * @param {Element} element - DOM element
 * @returns {boolean} True if visible
 */
export function isElementVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * Get all links on the page with context
 * @returns {Array<Object>} Array of link objects
 */
export function extractLinks() {
    const links = [];
    const anchorElements = document.querySelectorAll('a[href]');

    anchorElements.forEach(anchor => {
        if (isElementVisible(anchor)) {
            links.push({
                text: extractTextContent(anchor),
                href: anchor.href,
                isExternal: anchor.hostname !== window.location.hostname,
                classes: anchor.className,
                ariaLabel: anchor.getAttribute('aria-label')
            });
        }
    });

    return links;
}
