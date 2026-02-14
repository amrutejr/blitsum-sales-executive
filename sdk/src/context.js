/**
 * Context Extraction System
 * Intelligent extraction of page content to provide AI with situational awareness
 */

import {
    getVisibleElements,
    extractTextContent,
    calculateElementRelevance,
    getPageStructure,
    isElementVisible,
    extractLinks
} from './utils/domParser.js';

import {
    isPricingElement,
    isFeatureList,
    isFAQ,
    isProductCard,
    isCTA,
    detectElementType
} from './utils/contentClassifier.js';

import {
    cleanWhitespace,
    extractKeywords,
    summarizeText,
    extractPrices,
    isQuestion
} from './utils/textProcessor.js';

import {
    getCachedContent,
    cacheExtractedContent,
    generateCacheKey,
    hashContent,
    setupDOMChangeMonitoring
} from './utils/cache.js';

// Initialize DOM change monitoring for cache invalidation
let domObserver = null;
if (typeof window !== 'undefined') {
    domObserver = setupDOMChangeMonitoring();
}

/**
 * Extract comprehensive page context for AI (Main Orchestrator)
 * @returns {Object} Complete page context
 */
export function extractPageContext() {
    // Try to get from cache first
    const cacheKey = generateCacheKey();
    const cached = getCachedContent(cacheKey);

    if (cached) {
        console.log('[Context] Using cached page context');
        return cached;
    }

    console.log('[Context] Extracting fresh page context...');
    const startTime = performance.now();

    const context = {
        // Basic page info
        url: window.location.href,
        title: document.title,
        currentSection: getCurrentSection(),
        userScrollPosition: window.scrollY,

        // Page structure
        structure: getPageStructure(),

        // Extracted content by type
        content: {
            pricing: extractPricingTables(),
            features: extractFeatureLists(),
            faqs: extractFAQs(),
            products: extractProducts(),
            ctas: extractCTAs(),
            metadata: extractMetadata()
        },

        // Page keywords and summary
        keywords: extractPageKeywords(),
        summary: extractPageSummary(),

        // Links
        links: extractLinks(),

        // Extraction metadata
        extractedAt: new Date().toISOString(),
        extractionTime: 0 // Will be set below
    };

    const endTime = performance.now();
    context.extractionTime = Math.round(endTime - startTime);

    console.log(`[Context] Extraction completed in ${context.extractionTime}ms`);

    // Cache the result
    cacheExtractedContent(cacheKey, context);

    return context;
}

/**
 * Extract all content (alternative comprehensive extraction)
 * @returns {Object} All extracted content
 */
export function extractAllContent() {
    return extractPageContext();
}

/**
 * Detect which section the user is currently viewing
 * @returns {string} Section ID or description
 */
function getCurrentSection() {
    const sections = document.querySelectorAll('section[id], main, article, [role="main"]');

    for (const section of sections) {
        if (!isElementVisible(section)) continue;

        const rect = section.getBoundingClientRect();
        // Check if section is in viewport (top is above middle of screen)
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            // Try to get section identifier
            if (section.id) return section.id;

            // Try to get heading text
            const heading = section.querySelector('h1, h2, h3');
            if (heading) {
                return cleanWhitespace(extractTextContent(heading));
            }
        }
    }

    // Fallback: check scroll position
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (scrollPercent < 20) return 'top';
    if (scrollPercent > 80) return 'bottom';
    return 'middle';
}

/**
 * Extract pricing tables and plans from the page
 * @returns {Array<Object>} Array of pricing plans
 */
export function extractPricingTables() {
    const pricingPlans = [];
    const elements = getVisibleElements();

    // Find pricing containers
    const pricingContainers = elements.filter(el => isPricingElement(el));

    for (const container of pricingContainers) {
        // Look for individual pricing cards/items
        const cards = Array.from(container.children).filter(child => {
            const text = extractTextContent(child);
            return text.length > 20 && extractPrices(text).length > 0;
        });

        if (cards.length > 0) {
            // Extract each pricing plan
            cards.forEach(card => {
                const plan = extractPricingPlan(card);
                if (plan) {
                    pricingPlans.push(plan);
                }
            });
        } else {
            // Single pricing element
            const plan = extractPricingPlan(container);
            if (plan) {
                pricingPlans.push(plan);
            }
        }
    }

    return pricingPlans;
}

/**
 * Extract a single pricing plan from an element
 * @param {Element} element - Pricing element
 * @returns {Object|null} Pricing plan object
 */
function extractPricingPlan(element) {
    const text = extractTextContent(element);
    const prices = extractPrices(text);

    // Extract plan name (check h4 first for pricing cards, then other headings)
    let planName = 'Plan';
    const h4 = element.querySelector('h4');
    if (h4) {
        planName = cleanWhitespace(extractTextContent(h4));
    } else {
        const heading = element.querySelector('h1, h2, h3, h5, h6');
        if (heading) {
            planName = cleanWhitespace(extractTextContent(heading));
        }
    }

    // Extract features from ul > li elements only (avoid capturing other text)
    const features = [];
    const lists = element.querySelectorAll('ul');
    lists.forEach(ul => {
        const listItems = ul.querySelectorAll('li');
        listItems.forEach(item => {
            const itemText = cleanWhitespace(extractTextContent(item));
            // Filter out empty items and badges/labels
            if (itemText &&
                itemText.length > 3 &&
                itemText.length < 200 &&
                !itemText.toLowerCase().includes('most advanced') &&
                !itemText.toLowerCase().includes('popular')) {
                features.push(itemText);
            }
        });
    });

    // Check if this is the popular/recommended plan
    const isPopular = text.toLowerCase().includes('popular') ||
        text.toLowerCase().includes('recommended') ||
        text.toLowerCase().includes('best value') ||
        text.toLowerCase().includes('most advanced') ||
        element.className.toLowerCase().includes('popular') ||
        element.className.toLowerCase().includes('featured');

    // If no prices found, check for "Custom" or similar text
    let priceInfo = null;
    if (prices.length > 0) {
        priceInfo = {
            raw: prices[0].raw,
            value: prices[0].value,
            currency: prices[0].currency,
            period: prices[0].period
        };
    } else if (text.toLowerCase().includes('custom')) {
        priceInfo = {
            raw: 'Custom',
            value: null,
            currency: null,
            period: null
        };
    }

    if (!priceInfo) return null;

    return {
        plan: planName,
        price: priceInfo.raw,
        priceValue: priceInfo.value,
        currency: priceInfo.currency,
        period: priceInfo.period,
        features: features.slice(0, 15), // Increased to 15 features
        popular: isPopular
    };
}

/**
 * Extract feature lists from the page
 * @returns {Array<Object>} Array of features
 */
export function extractFeatureLists() {
    const features = [];
    const elements = getVisibleElements();

    // Find feature containers
    const featureContainers = elements.filter(el => isFeatureList(el));

    for (const container of featureContainers) {
        // Look for individual feature items
        const items = container.querySelectorAll('li, .card, .feature, [class*="feature"], [class*="bento"]');

        if (items.length > 0) {
            items.forEach(item => {
                const feature = extractFeature(item);
                if (feature) {
                    features.push(feature);
                }
            });
        }
    }

    // Remove duplicates based on name
    const uniqueFeatures = [];
    const seen = new Set();

    for (const feature of features) {
        if (!seen.has(feature.name)) {
            seen.add(feature.name);
            uniqueFeatures.push(feature);
        }
    }

    return uniqueFeatures;
}

/**
 * Extract a single feature from an element
 * @param {Element} element - Feature element
 * @returns {Object|null} Feature object
 */
function extractFeature(element) {
    const text = extractTextContent(element);
    if (!text || text.length < 10) return null;

    // Extract feature name (usually in a heading)
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    const name = heading ? cleanWhitespace(extractTextContent(heading)) : text.split('.')[0];

    // Extract description (text after heading or full text)
    let description = text;
    if (heading) {
        description = text.replace(extractTextContent(heading), '').trim();
    }
    description = summarizeText(description, 200);

    return {
        name: name.substring(0, 100), // Limit name length
        description: description
    };
}

/**
 * Extract FAQ content from the page
 * @returns {Array<Object>} Array of Q&A pairs
 */
export function extractFAQs() {
    const faqs = [];
    const elements = getVisibleElements();

    // Find FAQ containers
    const faqContainers = elements.filter(el => isFAQ(el));

    for (const container of faqContainers) {
        // Look for Q&A pairs
        const items = container.querySelectorAll('dt, [class*="question"], [role="button"]');

        items.forEach(questionEl => {
            const questionText = extractTextContent(questionEl);
            if (isQuestion(questionText)) {
                // Try to find the answer
                let answerEl = questionEl.nextElementSibling;
                if (answerEl && answerEl.tagName === 'DD') {
                    // Definition list format
                    const answer = extractTextContent(answerEl);
                    faqs.push({
                        question: cleanWhitespace(questionText),
                        answer: summarizeText(answer, 300)
                    });
                } else {
                    // Try to find answer in parent or nearby elements
                    const parent = questionEl.parentElement;
                    const allText = extractTextContent(parent);
                    const answer = allText.replace(questionText, '').trim();
                    if (answer.length > 10) {
                        faqs.push({
                            question: cleanWhitespace(questionText),
                            answer: summarizeText(answer, 300)
                        });
                    }
                }
            }
        });
    }

    return faqs.slice(0, 20); // Limit to 20 FAQs
}

/**
 * Extract product/service cards from the page
 * @returns {Array<Object>} Array of products
 */
export function extractProducts() {
    const products = [];
    const elements = getVisibleElements();

    // Find product cards
    const productCards = elements.filter(el => isProductCard(el));

    for (const card of productCards) {
        const product = extractProduct(card);
        if (product) {
            products.push(product);
        }
    }

    return products.slice(0, 20); // Limit to 20 products
}

/**
 * Extract a single product from an element
 * @param {Element} element - Product element
 * @returns {Object|null} Product object
 */
function extractProduct(element) {
    const text = extractTextContent(element);
    if (!text || text.length < 20) return null;

    // Extract product name
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    const name = heading ? cleanWhitespace(extractTextContent(heading)) : text.split('.')[0];

    // Extract description
    let description = text;
    if (heading) {
        description = text.replace(extractTextContent(heading), '').trim();
    }

    // Extract price if available
    const prices = extractPrices(text);
    const price = prices.length > 0 ? prices[0].raw : null;

    // Check for image
    const img = element.querySelector('img');
    const image = img ? img.src : null;

    return {
        name: name.substring(0, 100),
        description: summarizeText(description, 200),
        price: price,
        image: image
    };
}

/**
 * Extract Call-to-Action buttons from the page
 * @returns {Array<Object>} Array of CTAs
 */
export function extractCTAs() {
    const ctas = [];
    const elements = getVisibleElements();

    // Find CTA elements
    const ctaElements = elements.filter(el => isCTA(el));

    for (const cta of ctaElements) {
        const text = cleanWhitespace(extractTextContent(cta));
        const href = cta.getAttribute('href') || null;

        if (text && text.length > 0) {
            ctas.push({
                text: text,
                href: href,
                type: cta.tagName.toLowerCase()
            });
        }
    }

    return ctas.slice(0, 10); // Limit to 10 CTAs
}

/**
 * Extract metadata from the page (Schema, Open Graph, etc.)
 * @returns {Object} Metadata object
 */
export function extractMetadata() {
    const metadata = {
        siteName: null,
        description: null,
        ogTags: {},
        schema: []
    };

    // Extract Open Graph tags
    const ogTags = document.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
        const property = tag.getAttribute('property').replace('og:', '');
        const content = tag.getAttribute('content');
        metadata.ogTags[property] = content;
    });

    // Extract site name
    metadata.siteName = metadata.ogTags.site_name ||
        document.querySelector('meta[name="application-name"]')?.content ||
        document.title.split('|')[0].trim();

    // Extract description
    metadata.description = metadata.ogTags.description ||
        document.querySelector('meta[name="description"]')?.content ||
        '';

    // Extract JSON-LD schema
    const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
    schemaScripts.forEach(script => {
        try {
            const schema = JSON.parse(script.textContent);
            metadata.schema.push(schema);
        } catch (e) {
            // Ignore invalid JSON
        }
    });

    return metadata;
}

/**
 * Extract page keywords
 * @returns {Array<string>} Array of keywords
 */
function extractPageKeywords() {
    // Combine text from important elements
    const importantText = [];

    // Title and headings
    importantText.push(document.title);
    document.querySelectorAll('h1, h2, h3').forEach(h => {
        if (isElementVisible(h)) {
            importantText.push(extractTextContent(h));
        }
    });

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        importantText.push(metaDesc.content);
    }

    const combinedText = importantText.join(' ');
    return extractKeywords(combinedText, 15);
}

/**
 * Extract page summary
 * @returns {string} Page summary
 */
function extractPageSummary() {
    // Try to get from meta description first
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.content) {
        return metaDesc.content;
    }

    // Try to get from first paragraph in main content
    const main = document.querySelector('main, article, [role="main"]');
    if (main) {
        const firstP = main.querySelector('p');
        if (firstP) {
            return summarizeText(extractTextContent(firstP), 200);
        }
    }

    // Fallback: use first visible paragraph
    const paragraphs = document.querySelectorAll('p');
    for (const p of paragraphs) {
        if (isElementVisible(p)) {
            const text = extractTextContent(p);
            if (text.length > 50) {
                return summarizeText(text, 200);
            }
        }
    }

    return '';
}
