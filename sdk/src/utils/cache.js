/**
 * Cache Utilities
 * Performance optimization through intelligent caching
 */

class ContentCache {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
        this.maxAge = 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Set a cache entry
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, value, ttl = this.maxAge) {
        this.cache.set(key, value);
        this.timestamps.set(key, {
            created: Date.now(),
            ttl: ttl
        });
    }

    /**
     * Get a cache entry
     * @param {string} key - Cache key
     * @returns {*} Cached value or null if not found/expired
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const timestamp = this.timestamps.get(key);
        const age = Date.now() - timestamp.created;

        // Check if expired
        if (age > timestamp.ttl) {
            this.delete(key);
            return null;
        }

        return this.cache.get(key);
    }

    /**
     * Check if a key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} True if key exists and is valid
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Delete a cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.timestamps.clear();
    }

    /**
     * Clear expired entries
     */
    clearExpired() {
        const now = Date.now();
        for (const [key, timestamp] of this.timestamps.entries()) {
            const age = now - timestamp.created;
            if (age > timestamp.ttl) {
                this.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Global cache instance
const globalCache = new ContentCache();

/**
 * Cache extracted content with automatic invalidation
 * @param {string} key - Cache key
 * @param {*} content - Content to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export function cacheExtractedContent(key, content, ttl = 5 * 60 * 1000) {
    globalCache.set(key, content, ttl);
}

/**
 * Get cached content
 * @param {string} key - Cache key
 * @returns {*} Cached content or null
 */
export function getCachedContent(key) {
    return globalCache.get(key);
}

/**
 * Invalidate cache for a specific key
 * @param {string} key - Cache key
 */
export function invalidateCache(key) {
    if (key) {
        globalCache.delete(key);
    } else {
        globalCache.clear();
    }
}

/**
 * Clear all cached content
 */
export function clearAllCache() {
    globalCache.clear();
}

/**
 * Generate a cache key based on URL and content hash
 * @param {string} url - Current URL
 * @param {string} contentHash - Optional content hash
 * @returns {string} Cache key
 */
export function generateCacheKey(url = window.location.href, contentHash = '') {
    const baseKey = `content:${url}`;
    return contentHash ? `${baseKey}:${contentHash}` : baseKey;
}

/**
 * Simple hash function for content
 * @param {string} content - Content to hash
 * @returns {string} Hash string
 */
export function hashContent(content) {
    if (!content) return '';

    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}

/**
 * Get or compute cached value
 * @param {string} key - Cache key
 * @param {Function} computeFn - Function to compute value if not cached
 * @param {number} ttl - Time to live in milliseconds
 * @returns {*} Cached or computed value
 */
export async function getOrCompute(key, computeFn, ttl = 5 * 60 * 1000) {
    // Check cache first
    const cached = globalCache.get(key);
    if (cached !== null) {
        return cached;
    }

    // Compute value
    const value = await computeFn();

    // Cache it
    globalCache.set(key, value, ttl);

    return value;
}

/**
 * Setup automatic cache cleanup
 * @param {number} interval - Cleanup interval in milliseconds
 */
export function setupAutoCacheCleanup(interval = 60 * 1000) {
    setInterval(() => {
        globalCache.clearExpired();
    }, interval);
}

/**
 * Monitor DOM changes and invalidate cache when needed
 */
export function setupDOMChangeMonitoring() {
    let debounceTimer;

    const observer = new MutationObserver((mutations) => {
        // Debounce to avoid excessive invalidation
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            // Check if mutations are significant
            const significantChange = mutations.some(mutation => {
                // Ignore attribute changes on Blitsum elements
                if (mutation.target.id === 'blitsum-root' ||
                    mutation.target.closest('#blitsum-root')) {
                    return false;
                }

                // Consider text changes and element additions/removals as significant
                return mutation.type === 'childList' ||
                    (mutation.type === 'characterData' && mutation.target.textContent.length > 10);
            });

            if (significantChange) {
                console.log('[Cache] DOM changed significantly, invalidating cache');
                globalCache.clear();
            }
        }, 1000); // Wait 1 second after last change
    });

    // Observe the entire document body
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    return observer;
}

// Auto-start cache cleanup
setupAutoCacheCleanup();

export { globalCache };
