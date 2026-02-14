/**
 * Text Processor Utilities
 * Functions for cleaning, normalizing, and processing text content
 */

/**
 * Clean and normalize whitespace in text
 * @param {string} text - Input text
 * @returns {string} Cleaned text
 */
export function cleanWhitespace(text) {
    if (!text) return '';

    return text
        .replace(/\s+/g, ' ')           // Multiple spaces to single space
        .replace(/\n\s*\n/g, '\n')      // Multiple newlines to single newline
        .trim();                         // Remove leading/trailing whitespace
}

/**
 * Remove special characters while preserving meaningful punctuation
 * @param {string} text - Input text
 * @param {Object} options - Cleaning options
 * @returns {string} Cleaned text
 */
export function removeSpecialChars(text, options = {}) {
    if (!text) return '';

    const {
        keepPunctuation = true,
        keepNumbers = true,
        keepCurrency = true
    } = options;

    let cleaned = text;

    // Remove zero-width characters and other invisible characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

    if (!keepCurrency) {
        cleaned = cleaned.replace(/[$€£¥₹]/g, '');
    }

    if (!keepNumbers) {
        cleaned = cleaned.replace(/\d+/g, '');
    }

    if (!keepPunctuation) {
        cleaned = cleaned.replace(/[^\w\s]/g, '');
    }

    return cleanWhitespace(cleaned);
}

/**
 * Extract keywords from text
 * @param {string} text - Input text
 * @param {number} maxKeywords - Maximum number of keywords to return
 * @returns {Array<string>} Array of keywords
 */
export function extractKeywords(text, maxKeywords = 10) {
    if (!text) return [];

    // Common stop words to filter out
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
        'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
        'what', 'which', 'who', 'when', 'where', 'why', 'how'
    ]);

    // Clean and split text into words
    const words = cleanWhitespace(text.toLowerCase())
        .split(/\s+/)
        .filter(word => word.length > 2) // Filter short words
        .filter(word => !stopWords.has(word)) // Filter stop words
        .filter(word => /^[a-z]+$/.test(word)); // Only alphabetic words

    // Count word frequency
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(([word]) => word);
}

/**
 * Summarize text to a specific length
 * @param {string} text - Input text
 * @param {number} maxLength - Maximum length in characters
 * @returns {string} Summarized text
 */
export function summarizeText(text, maxLength = 200) {
    if (!text) return '';

    const cleaned = cleanWhitespace(text);

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    // Try to break at sentence boundary
    const sentences = cleaned.split(/[.!?]+/);
    let summary = '';

    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;

        if ((summary + trimmed).length <= maxLength - 3) {
            summary += (summary ? '. ' : '') + trimmed;
        } else {
            break;
        }
    }

    // If we got at least one sentence, return it
    if (summary.length > 0) {
        return summary + (summary.endsWith('.') ? '' : '...');
    }

    // Otherwise, just truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
}

/**
 * Detect the primary language of text (simple heuristic)
 * @param {string} text - Input text
 * @returns {string} Language code (en, es, fr, etc.) or 'unknown'
 */
export function detectLanguage(text) {
    if (!text || text.length < 10) return 'unknown';

    // Simple heuristic based on common words
    const languagePatterns = {
        en: /\b(the|and|is|are|was|were|have|has|will|would|can|could)\b/gi,
        es: /\b(el|la|los|las|de|que|y|es|en|por|para|con)\b/gi,
        fr: /\b(le|la|les|de|et|est|dans|pour|avec|ce|qui)\b/gi,
        de: /\b(der|die|das|und|ist|in|zu|den|mit|von|für)\b/gi,
        it: /\b(il|la|di|e|è|in|per|con|che|da|un)\b/gi
    };

    const scores = {};

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        const matches = text.match(pattern);
        scores[lang] = matches ? matches.length : 0;
    }

    // Find language with highest score
    const detected = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])[0];

    return detected && detected[1] > 2 ? detected[0] : 'en'; // Default to English
}

/**
 * Extract price information from text
 * @param {string} text - Input text
 * @returns {Array<Object>} Array of price objects
 */
export function extractPrices(text) {
    if (!text) return [];

    const prices = [];

    // Pattern for various price formats
    const patterns = [
        /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,                    // $99, $1,999.99
        /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd|\$)/g,    // 99 USD, 99$
        /€(\d+(?:,\d{3})*(?:\.\d{2})?)/g,                     // €99
        /£(\d+(?:,\d{3})*(?:\.\d{2})?)/g,                     // £99
        /(\d+)\s*\/\s*mo(?:nth)?/gi,                          // 99/mo, 99/month
        /(\d+)\s*per\s*month/gi                               // 99 per month
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const priceStr = match[1] || match[0];
            const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));

            if (!isNaN(numericValue)) {
                prices.push({
                    raw: match[0],
                    value: numericValue,
                    currency: match[0].includes('€') ? 'EUR' :
                        match[0].includes('£') ? 'GBP' : 'USD',
                    period: match[0].toLowerCase().includes('mo') ? 'monthly' : 'one-time'
                });
            }
        }
    });

    return prices;
}

/**
 * Normalize text for comparison (lowercase, remove punctuation, etc.)
 * @param {string} text - Input text
 * @returns {string} Normalized text
 */
export function normalizeForComparison(text) {
    if (!text) return '';

    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Check if text contains a question
 * @param {string} text - Input text
 * @returns {boolean} True if text appears to be a question
 */
export function isQuestion(text) {
    if (!text) return false;

    const trimmed = text.trim();

    // Ends with question mark
    if (trimmed.endsWith('?')) return true;

    // Starts with question words
    const questionWords = /^(what|how|why|when|where|who|which|can|is|are|do|does|will|would|should|could)/i;
    return questionWords.test(trimmed);
}
