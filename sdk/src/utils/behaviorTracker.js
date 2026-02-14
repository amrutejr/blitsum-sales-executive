/**
 * Behavior Tracker
 * Tracks user behavior to inform engagement strategy
 */

export class BehaviorTracker {
    constructor() {
        this.behavior = {
            timeOnPage: 0,
            scrollDepth: 0,
            maxScrollDepth: 0,
            pricingViewed: false,
            featuresViewed: false,
            ctaHovered: 0,
            ctaClicked: false,
            mouseMovements: 0,
            exitIntentDetected: false,
            planComparisons: 0,
            messagesSent: 0,
            lastActivityTime: Date.now(),
            sessionStartTime: Date.now()
        };

        this.listeners = [];
        this.initialized = false;
    }

    /**
     * Initialize behavior tracking
     */
    init() {
        if (this.initialized) return;

        // Track time on page
        this.startTimeTracking();

        // Track scroll behavior
        this.trackScrollBehavior();

        // Track mouse movements
        this.trackMouseBehavior();

        // Track CTA interactions
        this.trackCTAInteractions();

        // Track exit intent
        this.trackExitIntent();

        // Track section views
        this.trackSectionViews();

        this.initialized = true;
        console.log('[BehaviorTracker] Initialized');
    }

    /**
     * Start tracking time on page
     */
    startTimeTracking() {
        setInterval(() => {
            this.behavior.timeOnPage = Math.floor((Date.now() - this.behavior.sessionStartTime) / 1000);
        }, 1000);
    }

    /**
     * Track scroll behavior
     */
    trackScrollBehavior() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

                this.behavior.scrollDepth = scrollPercent;
                this.behavior.maxScrollDepth = Math.max(this.behavior.maxScrollDepth, scrollPercent);
                this.behavior.lastActivityTime = Date.now();

                this.notifyListeners('scroll', { scrollDepth: scrollPercent });
            }, 100);
        });
    }

    /**
     * Track mouse behavior
     */
    trackMouseBehavior() {
        let moveCount = 0;
        let moveTimeout;

        window.addEventListener('mousemove', (e) => {
            moveCount++;
            this.behavior.lastActivityTime = Date.now();

            clearTimeout(moveTimeout);
            moveTimeout = setTimeout(() => {
                this.behavior.mouseMovements = moveCount;
            }, 500);
        });
    }

    /**
     * Track CTA interactions
     */
    trackCTAInteractions() {
        // Track all buttons and links
        const trackElement = (element) => {
            // Track hover
            element.addEventListener('mouseenter', () => {
                const isCTA = this.isCTAElement(element);
                if (isCTA) {
                    this.behavior.ctaHovered++;
                    this.notifyListeners('ctaHover', { element, count: this.behavior.ctaHovered });
                }
            });

            // Track click
            element.addEventListener('click', () => {
                const isCTA = this.isCTAElement(element);
                if (isCTA) {
                    this.behavior.ctaClicked = true;
                    this.notifyListeners('ctaClick', { element });
                }
            });
        };

        // Track existing elements
        document.querySelectorAll('button, a').forEach(trackElement);

        // Track dynamically added elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.matches('button, a')) {
                            trackElement(node);
                        }
                        node.querySelectorAll('button, a').forEach(trackElement);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Check if element is a CTA
     */
    isCTAElement(element) {
        const text = element.textContent.toLowerCase();
        const ctaKeywords = [
            'sign up', 'get started', 'start', 'try', 'buy', 'purchase',
            'subscribe', 'join', 'register', 'demo', 'contact', 'learn more'
        ];

        return ctaKeywords.some(keyword => text.includes(keyword)) ||
            element.classList.contains('btn-primary') ||
            element.classList.contains('cta');
    }

    /**
     * Track exit intent
     */
    trackExitIntent() {
        document.addEventListener('mouseleave', (e) => {
            // Detect if mouse is leaving toward top of page (close button area)
            if (e.clientY <= 0) {
                this.behavior.exitIntentDetected = true;
                this.notifyListeners('exitIntent', {});
            }
        });
    }

    /**
     * Track section views
     */
    trackSectionViews() {
        const checkSectionView = () => {
            // Check if pricing section is in view
            const pricingSection = document.querySelector('#pricing, [data-section="pricing"]');
            if (pricingSection && this.isElementInView(pricingSection)) {
                if (!this.behavior.pricingViewed) {
                    this.behavior.pricingViewed = true;
                    this.notifyListeners('pricingView', {});
                }
            }

            // Check if features section is in view
            const featuresSection = document.querySelector('#features, [data-section="features"]');
            if (featuresSection && this.isElementInView(featuresSection)) {
                if (!this.behavior.featuresViewed) {
                    this.behavior.featuresViewed = true;
                    this.notifyListeners('featuresView', {});
                }
            }
        };

        // Check on scroll
        window.addEventListener('scroll', () => {
            setTimeout(checkSectionView, 100);
        });

        // Initial check
        setTimeout(checkSectionView, 1000);
    }

    /**
     * Check if element is in viewport
     */
    isElementInView(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Track plan comparison
     */
    trackPlanComparison() {
        this.behavior.planComparisons++;
        this.notifyListeners('planComparison', { count: this.behavior.planComparisons });
    }

    /**
     * Track message sent
     */
    trackMessageSent() {
        this.behavior.messagesSent++;
        this.behavior.lastActivityTime = Date.now();
        this.notifyListeners('messageSent', { count: this.behavior.messagesSent });
    }

    /**
     * Get current behavior data
     */
    getBehavior() {
        return { ...this.behavior };
    }

    /**
     * Get inactivity duration in seconds
     */
    getInactivityDuration() {
        return Math.floor((Date.now() - this.behavior.lastActivityTime) / 1000);
    }

    /**
     * Add behavior change listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove behavior change listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Notify all listeners
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data, this.behavior);
            } catch (error) {
                console.error('[BehaviorTracker] Listener error:', error);
            }
        });
    }

    /**
     * Reset behavior tracking
     */
    reset() {
        this.behavior = {
            timeOnPage: 0,
            scrollDepth: 0,
            maxScrollDepth: 0,
            pricingViewed: false,
            featuresViewed: false,
            ctaHovered: 0,
            ctaClicked: false,
            mouseMovements: 0,
            exitIntentDetected: false,
            planComparisons: 0,
            messagesSent: 0,
            lastActivityTime: Date.now(),
            sessionStartTime: Date.now()
        };
    }
}

// Export singleton instance
export const behaviorTracker = new BehaviorTracker();
