/**
 * Engagement Triggers
 * Detects behavioral signals and triggers proactive engagement
 */

import { behaviorTracker } from '../utils/behaviorTracker.js';

export class EngagementTriggers {
    constructor() {
        this.triggers = new Map();
        this.firedTriggers = new Set();
        this.listeners = [];
        this.initialized = false;

        // Define trigger configurations
        this.defineTriggers();
    }

    /**
     * Define all engagement triggers
     * All automatic triggers disabled - AI only responds to user-initiated interactions
     */
    defineTriggers() {
        // All automatic engagement triggers have been disabled
        // The AI will only respond when users actively engage via chat or voice
    }

    /**
     * Add a trigger
     */
    addTrigger(id, config) {
        this.triggers.set(id, {
            id,
            ...config,
            lastFired: 0
        });
    }

    /**
     * Initialize engagement triggers
     */
    init() {
        if (this.initialized) return;

        // Initialize behavior tracker
        behaviorTracker.init();

        // Listen to behavior changes
        behaviorTracker.addListener((event, data, behavior) => {
            this.checkTriggers(behavior);
        });

        // Periodic check for time-based triggers
        setInterval(() => {
            const behavior = behaviorTracker.getBehavior();
            this.checkTriggers(behavior);
        }, 5000); // Check every 5 seconds

        // Mark as visited
        localStorage.setItem('blitsum_visited', 'true');

        this.initialized = true;
        console.log('[EngagementTriggers] Initialized with', this.triggers.size, 'triggers');
    }

    /**
     * Check all triggers
     */
    checkTriggers(behavior) {
        const now = Date.now();

        // Sort triggers by priority
        const sortedTriggers = Array.from(this.triggers.values()).sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        for (const trigger of sortedTriggers) {
            // Skip if already fired and within cooldown
            if (this.firedTriggers.has(trigger.id)) {
                const timeSinceFired = now - trigger.lastFired;
                if (timeSinceFired < trigger.cooldown) {
                    continue;
                }
            }

            // Check condition
            try {
                const shouldFire = trigger.condition(behavior, behaviorTracker);

                if (shouldFire) {
                    // Fire trigger after delay
                    setTimeout(() => {
                        this.fireTrigger(trigger);
                    }, trigger.delay);

                    // Mark as fired
                    this.firedTriggers.add(trigger.id);
                    trigger.lastFired = now;

                    // Only fire one trigger at a time (highest priority wins)
                    break;
                }
            } catch (error) {
                console.error(`[EngagementTriggers] Error checking trigger ${trigger.id}:`, error);
            }
        }
    }

    /**
     * Fire a trigger
     */
    fireTrigger(trigger) {
        console.log(`[EngagementTriggers] Firing trigger: ${trigger.id}`, trigger);

        // Notify listeners
        this.listeners.forEach(callback => {
            try {
                callback(trigger);
            } catch (error) {
                console.error('[EngagementTriggers] Listener error:', error);
            }
        });
    }

    /**
     * Add trigger listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove trigger listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Reset all triggers
     */
    reset() {
        this.firedTriggers.clear();
        this.triggers.forEach(trigger => {
            trigger.lastFired = 0;
        });
    }

    /**
     * Manually fire a trigger by ID
     */
    manuallyFireTrigger(triggerId) {
        const trigger = this.triggers.get(triggerId);
        if (trigger) {
            this.fireTrigger(trigger);
        }
    }

    /**
     * Get trigger status
     */
    getTriggerStatus() {
        const status = {};
        this.triggers.forEach((trigger, id) => {
            status[id] = {
                fired: this.firedTriggers.has(id),
                lastFired: trigger.lastFired,
                priority: trigger.priority
            };
        });
        return status;
    }
}

// Export singleton instance
export const engagementTriggers = new EngagementTriggers();
