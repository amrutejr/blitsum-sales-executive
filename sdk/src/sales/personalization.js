/**
 * Personalization Strategy
 * Advanced AI-driven personalization for sales conversations
 */

/**
 * User Profile Builder
 * Builds comprehensive user profiles from conversation data
 */
export class UserProfileBuilder {
    constructor() {
        this.profile = {
            type: 'unknown',
            companySize: 'unknown',
            industry: 'unknown',
            urgency: 'unknown',
            budget: 'unknown',
            painPoints: [],
            interests: [],
            objections: [],
            behavior: {},
            confidence: 0
        };
    }

    /**
     * Build profile from conversation history
     * @param {Array<Object>} conversationHistory - Full conversation
     * @param {Object} behaviorData - User behavior (clicks, time, etc.)
     * @returns {Object} Complete user profile
     */
    build(conversationHistory, behaviorData = {}) {
        const userMessages = conversationHistory
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);

        // Detect user type
        this.profile.type = this.detectUserType(userMessages);

        // Detect company size
        this.profile.companySize = this.detectCompanySize(userMessages);

        // Detect industry
        this.profile.industry = this.detectIndustry(userMessages);

        // Detect urgency
        this.profile.urgency = this.detectUrgency(userMessages);

        // Detect budget level
        this.profile.budget = this.detectBudget(userMessages);

        // Extract pain points
        this.profile.painPoints = this.extractPainPoints(userMessages);

        // Extract interests
        this.profile.interests = this.extractInterests(userMessages);

        // Extract objections
        this.profile.objections = this.extractObjections(userMessages);

        // Analyze behavior
        this.profile.behavior = this.analyzeBehavior(behaviorData);

        // Calculate confidence
        this.profile.confidence = this.calculateConfidence();

        return this.profile;
    }

    /**
     * Detect user type (researcher, buyer, skeptic, explorer)
     */
    detectUserType(messages) {
        const text = messages.join(' ').toLowerCase();

        const typeSignals = {
            buyer: {
                keywords: ['price', 'buy', 'purchase', 'sign up', 'get started', 'trial', 'cost', 'how much'],
                score: 0
            },
            researcher: {
                keywords: ['compare', 'features', 'how does', 'documentation', 'specs', 'technical', 'details'],
                score: 0
            },
            skeptic: {
                keywords: ['really', 'prove', 'show me', 'evidence', 'case study', 'reviews', 'trust', 'guarantee'],
                score: 0
            },
            explorer: {
                keywords: ['what is', 'tell me', 'explain', 'show me around', 'curious', 'learning'],
                score: 0
            }
        };

        // Calculate scores
        for (const [type, data] of Object.entries(typeSignals)) {
            data.score = data.keywords.filter(kw => text.includes(kw)).length;
        }

        // Get highest score
        const winner = Object.entries(typeSignals)
            .sort((a, b) => b[1].score - a[1].score)[0];

        return winner[1].score > 0 ? winner[0] : 'explorer';
    }

    /**
     * Detect company size
     */
    detectCompanySize(messages) {
        const text = messages.join(' ').toLowerCase();

        const sizeSignals = {
            startup: ['startup', 'small team', 'just launched', 'founding', 'early stage', '2-10 people'],
            smb: ['small business', 'medium', '10-50', '50-100', 'growing company'],
            enterprise: ['enterprise', 'large company', '500+', '1000+', 'corporation', 'global']
        };

        for (const [size, keywords] of Object.entries(sizeSignals)) {
            if (keywords.some(kw => text.includes(kw))) {
                return size;
            }
        }

        return 'unknown';
    }

    /**
     * Detect industry
     */
    detectIndustry(messages) {
        const text = messages.join(' ').toLowerCase();

        const industries = {
            saas: ['saas', 'software', 'app', 'platform', 'cloud'],
            ecommerce: ['ecommerce', 'online store', 'shop', 'retail', 'products'],
            agency: ['agency', 'consulting', 'services', 'clients'],
            healthcare: ['healthcare', 'medical', 'hospital', 'clinic', 'patients'],
            finance: ['finance', 'banking', 'fintech', 'investment'],
            education: ['education', 'school', 'university', 'learning', 'students']
        };

        for (const [industry, keywords] of Object.entries(industries)) {
            if (keywords.some(kw => text.includes(kw))) {
                return industry;
            }
        }

        return 'unknown';
    }

    /**
     * Detect urgency level
     */
    detectUrgency(messages) {
        const text = messages.join(' ').toLowerCase();

        const urgencyLevels = {
            high: ['urgent', 'asap', 'immediately', 'today', 'now', 'critical', 'emergency'],
            medium: ['soon', 'this week', 'this month', 'planning', 'need to'],
            low: ['exploring', 'researching', 'maybe', 'eventually', 'someday', 'future']
        };

        for (const [level, keywords] of Object.entries(urgencyLevels)) {
            if (keywords.some(kw => text.includes(kw))) {
                return level;
            }
        }

        return 'medium';
    }

    /**
     * Detect budget level
     */
    detectBudget(messages) {
        const text = messages.join(' ').toLowerCase();

        if (text.includes('budget approved') || text.includes('ready to invest')) {
            return 'high';
        }
        if (text.includes('free') || text.includes('cheap') || text.includes('no budget')) {
            return 'low';
        }
        if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
            return 'medium';
        }

        return 'unknown';
    }

    /**
     * Extract pain points
     */
    extractPainPoints(messages) {
        const painKeywords = [
            'problem', 'issue', 'challenge', 'struggle', 'difficult',
            'slow', 'expensive', 'frustrated', 'losing', 'wasting'
        ];

        const painPoints = [];
        messages.forEach(msg => {
            const lower = msg.toLowerCase();
            painKeywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    painPoints.push(msg);
                }
            });
        });

        return [...new Set(painPoints)]; // Remove duplicates
    }

    /**
     * Extract interests
     */
    extractInterests(messages) {
        const interestKeywords = [
            'interested in', 'want to', 'looking for', 'need',
            'like to', 'hoping to', 'trying to'
        ];

        const interests = [];
        messages.forEach(msg => {
            const lower = msg.toLowerCase();
            interestKeywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    interests.push(msg);
                }
            });
        });

        return [...new Set(interests)];
    }

    /**
     * Extract objections
     */
    extractObjections(messages) {
        const objectionKeywords = [
            'but', 'however', 'expensive', 'not sure', 'concern',
            'worried', 'doubt', 'hesitant', 'problem is'
        ];

        const objections = [];
        messages.forEach(msg => {
            const lower = msg.toLowerCase();
            objectionKeywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    objections.push(msg);
                }
            });
        });

        return [...new Set(objections)];
    }

    /**
     * Analyze behavior patterns
     */
    analyzeBehavior(behaviorData) {
        return {
            timeOnPage: behaviorData.timeOnPage || 0,
            pagesViewed: behaviorData.pagesViewed || 1,
            pricingViewed: behaviorData.pricingViewed || false,
            featuresViewed: behaviorData.featuresViewed || false,
            ctaClicked: behaviorData.ctaClicked || false,
            messageCount: behaviorData.messageCount || 0,
            avgResponseTime: behaviorData.avgResponseTime || 0
        };
    }

    /**
     * Calculate profile confidence
     */
    calculateConfidence() {
        let score = 0;
        const weights = {
            type: 0.2,
            companySize: 0.15,
            industry: 0.1,
            urgency: 0.2,
            budget: 0.15,
            painPoints: 0.1,
            interests: 0.1
        };

        if (this.profile.type !== 'unknown') score += weights.type;
        if (this.profile.companySize !== 'unknown') score += weights.companySize;
        if (this.profile.industry !== 'unknown') score += weights.industry;
        if (this.profile.urgency !== 'unknown') score += weights.urgency;
        if (this.profile.budget !== 'unknown') score += weights.budget;
        if (this.profile.painPoints.length > 0) score += weights.painPoints;
        if (this.profile.interests.length > 0) score += weights.interests;

        return score;
    }
}

/**
 * Personalization Engine
 * Generates personalized responses based on user profile
 */
export class PersonalizationEngine {
    /**
     * Personalize response based on user profile
     * @param {string} baseResponse - Base AI response
     * @param {Object} userProfile - User profile
     * @param {Object} context - Additional context
     * @returns {string} Personalized response
     */
    static personalize(baseResponse, userProfile, context = {}) {
        let personalized = baseResponse;

        // Apply user type personalization
        personalized = this.personalizeByType(personalized, userProfile.type);

        // Apply company size personalization
        personalized = this.personalizeByCompanySize(personalized, userProfile.companySize);

        // Apply urgency personalization
        personalized = this.personalizeByUrgency(personalized, userProfile.urgency);

        // Apply budget personalization
        personalized = this.personalizeByBudget(personalized, userProfile.budget);

        // Add pain point references
        personalized = this.addPainPointReferences(personalized, userProfile.painPoints);

        return personalized;
    }

    /**
     * Personalize by user type
     */
    static personalizeByType(response, type) {
        const typeModifiers = {
            buyer: {
                prefix: '',
                suffix: ' Ready to get started?',
                emphasis: 'action'
            },
            researcher: {
                prefix: 'Here are the details: ',
                suffix: ' Want more technical information?',
                emphasis: 'details'
            },
            skeptic: {
                prefix: '',
                suffix: ' We have case studies and a 14-day money-back guarantee.',
                emphasis: 'proof'
            },
            explorer: {
                prefix: 'Let me explain: ',
                suffix: ' What else would you like to know?',
                emphasis: 'education'
            }
        };

        const modifier = typeModifiers[type] || typeModifiers.explorer;
        return `${modifier.prefix}${response}${modifier.suffix}`;
    }

    /**
     * Personalize by company size
     */
    static personalizeByCompanySize(response, size) {
        const sizeModifiers = {
            startup: ' Perfect for startups - quick setup, affordable pricing.',
            smb: ' Ideal for growing businesses like yours.',
            enterprise: ' Enterprise-grade with dedicated support and custom solutions.'
        };

        const modifier = sizeModifiers[size];
        return modifier ? `${response}${modifier}` : response;
    }

    /**
     * Personalize by urgency
     */
    static personalizeByUrgency(response, urgency) {
        const urgencyModifiers = {
            high: ' I can get you set up in the next 5 minutes.',
            medium: ' We can have you up and running this week.',
            low: ' Take your time to explore - I\'m here when you\'re ready.'
        };

        const modifier = urgencyModifiers[urgency];
        return modifier ? `${response}${modifier}` : response;
    }

    /**
     * Personalize by budget
     */
    static personalizeByBudget(response, budget) {
        const budgetModifiers = {
            high: ' We offer premium plans with dedicated support.',
            medium: ' We have flexible pricing to fit your budget.',
            low: ' We have a free tier to get you started with zero risk.'
        };

        const modifier = budgetModifiers[budget];
        return modifier ? `${response}${modifier}` : response;
    }

    /**
     * Add pain point references
     */
    static addPainPointReferences(response, painPoints) {
        if (painPoints.length === 0) return response;

        const firstPainPoint = painPoints[0].toLowerCase();

        // Extract key pain point phrase
        const painKeywords = ['slow', 'expensive', 'difficult', 'losing', 'wasting'];
        const painKeyword = painKeywords.find(kw => firstPainPoint.includes(kw));

        if (painKeyword) {
            return `I hear that ${painKeyword} is a real issue. ${response}`;
        }

        return response;
    }

    /**
     * Generate personalized greeting
     */
    static generateGreeting(userProfile, timeOfDay) {
        const greetings = {
            buyer: "Hi! Looking to get started?",
            researcher: "Hello! Happy to answer any questions.",
            skeptic: "Hi there! I know you're being careful - smart move.",
            explorer: "Hey! Welcome. What brings you here today?"
        };

        return greetings[userProfile.type] || "Hi! How can I help you today?";
    }

    /**
     * Generate personalized value proposition
     */
    static generateValueProp(userProfile, pageContext) {
        const valuePropsByType = {
            buyer: "Get started in 2 minutes. See results today.",
            researcher: "Comprehensive features. Full documentation. Technical support.",
            skeptic: "14-day free trial. No credit card. Money-back guarantee.",
            explorer: "Easy to use. Powerful results. Join 10,000+ companies."
        };

        const valuePropsBySize = {
            startup: "Startup-friendly pricing. Quick setup. Scale as you grow.",
            smb: "Perfect for growing businesses. Affordable. Powerful.",
            enterprise: "Enterprise-grade. Dedicated support. Custom solutions."
        };

        let valueProp = valuePropsByType[userProfile.type] || valuePropsByType.explorer;

        if (userProfile.companySize !== 'unknown') {
            valueProp += ` ${valuePropsBySize[userProfile.companySize]}`;
        }

        return valueProp;
    }

    /**
     * Generate personalized CTA
     */
    static generateCTA(userProfile) {
        const ctasByType = {
            buyer: "Start your free trial now →",
            researcher: "See full feature list →",
            skeptic: "Try it risk-free for 14 days →",
            explorer: "Learn more →"
        };

        return ctasByType[userProfile.type] || "Get started →";
    }
}

/**
 * Dynamic Personalization Rules
 */
export const PersonalizationRules = {
    /**
     * Get response style based on profile
     */
    getResponseStyle(userProfile) {
        const styles = {
            buyer: {
                length: 'short',
                tone: 'direct',
                focus: 'action',
                questions: 'few'
            },
            researcher: {
                length: 'medium',
                tone: 'detailed',
                focus: 'information',
                questions: 'moderate'
            },
            skeptic: {
                length: 'medium',
                tone: 'reassuring',
                focus: 'proof',
                questions: 'moderate'
            },
            explorer: {
                length: 'short',
                tone: 'friendly',
                focus: 'guidance',
                questions: 'many'
            }
        };

        return styles[userProfile.type] || styles.explorer;
    },

    /**
     * Get recommended plan based on profile
     */
    getRecommendedPlan(userProfile, plans) {
        if (!plans || plans.length === 0) return null;

        // Startup → Free/Starter
        if (userProfile.companySize === 'startup') {
            return plans[0];
        }

        // Enterprise → Highest tier
        if (userProfile.companySize === 'enterprise') {
            return plans[plans.length - 1];
        }

        // High budget → Premium plan
        if (userProfile.budget === 'high') {
            return plans[plans.length - 1];
        }

        // Low budget → Free/Starter
        if (userProfile.budget === 'low') {
            return plans[0];
        }

        // Default → Popular or middle plan
        const popularPlan = plans.find(p => p.popular);
        return popularPlan || plans[Math.floor(plans.length / 2)];
    },

    /**
     * Get personalized features to highlight
     */
    getFeaturesToHighlight(userProfile, allFeatures) {
        const featurePriority = {
            buyer: ['quick setup', 'easy to use', 'immediate results'],
            researcher: ['advanced features', 'api access', 'integrations'],
            skeptic: ['security', 'reliability', 'support'],
            explorer: ['popular features', 'getting started', 'tutorials']
        };

        const priorities = featurePriority[userProfile.type] || featurePriority.explorer;

        return allFeatures
            .filter(f => priorities.some(p => f.name.toLowerCase().includes(p)))
            .slice(0, 3);
    }
};

/**
 * THE BEST PERSONALIZATION STRATEGY
 * Comprehensive personalization system
 */
export class BestPersonalizationStrategy {
    constructor() {
        this.profileBuilder = new UserProfileBuilder();
        this.userProfile = null;
    }

    /**
     * Initialize personalization for a conversation
     */
    initialize(conversationHistory, behaviorData) {
        this.userProfile = this.profileBuilder.build(conversationHistory, behaviorData);
        return this.userProfile;
    }

    /**
     * Get personalized response
     */
    getPersonalizedResponse(baseResponse, context) {
        if (!this.userProfile) {
            return baseResponse;
        }

        return PersonalizationEngine.personalize(
            baseResponse,
            this.userProfile,
            context
        );
    }

    /**
     * Get complete personalization package
     */
    getPersonalizationPackage(pageContext) {
        if (!this.userProfile) {
            return null;
        }

        return {
            profile: this.userProfile,
            greeting: PersonalizationEngine.generateGreeting(this.userProfile),
            valueProp: PersonalizationEngine.generateValueProp(this.userProfile, pageContext),
            cta: PersonalizationEngine.generateCTA(this.userProfile),
            recommendedPlan: PersonalizationRules.getRecommendedPlan(this.userProfile, pageContext.pricing),
            featuresToHighlight: PersonalizationRules.getFeaturesToHighlight(this.userProfile, pageContext.features),
            responseStyle: PersonalizationRules.getResponseStyle(this.userProfile)
        };
    }

    /**
     * Update profile with new conversation data
     */
    update(newMessages, newBehaviorData) {
        // Rebuild profile with updated data
        const allMessages = [...this.profileBuilder.profile.messages, ...newMessages];
        this.userProfile = this.profileBuilder.build(allMessages, newBehaviorData);
        return this.userProfile;
    }
}
