/**
 * Sales Methodology Framework
 * Implements BANT + SPIN selling methodology for AI sales conversations
 */

/**
 * BANT Qualification Framework
 * Budget, Authority, Need, Timeline
 */
export const BANTFramework = {
    /**
     * Assess BANT qualification score
     * @param {Object} conversationData - Conversation analysis
     * @returns {Object} BANT assessment
     */
    assess(conversationData) {
        const budget = this.assessBudget(conversationData);
        const authority = this.assessAuthority(conversationData);
        const need = this.assessNeed(conversationData);
        const timeline = this.assessTimeline(conversationData);

        const totalScore = (budget.score + authority.score + need.score + timeline.score) / 4;
        const isQualified = totalScore >= 0.6; // 60% threshold

        return {
            budget,
            authority,
            need,
            timeline,
            totalScore,
            isQualified,
            recommendation: this.getRecommendation(totalScore)
        };
    },

    /**
     * Assess budget qualification
     */
    assessBudget(data) {
        const budgetSignals = {
            high: ['budget approved', 'ready to invest', 'what\'s the price', 'how much'],
            medium: ['exploring options', 'what are the costs', 'pricing'],
            low: ['free', 'cheap', 'no budget', 'can\'t afford'],
            unknown: []
        };

        const messages = data.messages.join(' ').toLowerCase();

        if (budgetSignals.high.some(s => messages.includes(s))) {
            return { score: 1.0, level: 'high', confidence: 'strong' };
        }
        if (budgetSignals.medium.some(s => messages.includes(s))) {
            return { score: 0.7, level: 'medium', confidence: 'moderate' };
        }
        if (budgetSignals.low.some(s => messages.includes(s))) {
            return { score: 0.3, level: 'low', confidence: 'weak' };
        }

        return { score: 0.5, level: 'unknown', confidence: 'unknown' };
    },

    /**
     * Assess authority qualification
     */
    assessAuthority(data) {
        const authoritySignals = {
            high: ['i decide', 'my decision', 'i\'m the', 'owner', 'ceo', 'founder'],
            medium: ['i can recommend', 'i\'ll propose', 'part of team'],
            low: ['need to ask', 'not my decision', 'have to check'],
            unknown: []
        };

        const messages = data.messages.join(' ').toLowerCase();

        if (authoritySignals.high.some(s => messages.includes(s))) {
            return { score: 1.0, level: 'decision-maker', confidence: 'strong' };
        }
        if (authoritySignals.medium.some(s => messages.includes(s))) {
            return { score: 0.7, level: 'influencer', confidence: 'moderate' };
        }
        if (authoritySignals.low.some(s => messages.includes(s))) {
            return { score: 0.4, level: 'researcher', confidence: 'weak' };
        }

        return { score: 0.6, level: 'unknown', confidence: 'unknown' };
    },

    /**
     * Assess need qualification
     */
    assessNeed(data) {
        const needSignals = {
            high: ['urgent', 'critical', 'must have', 'need asap', 'struggling with'],
            medium: ['looking for', 'interested in', 'want to improve'],
            low: ['just browsing', 'curious', 'maybe later'],
            unknown: []
        };

        const messages = data.messages.join(' ').toLowerCase();

        if (needSignals.high.some(s => messages.includes(s))) {
            return { score: 1.0, level: 'critical', confidence: 'strong' };
        }
        if (needSignals.medium.some(s => messages.includes(s))) {
            return { score: 0.7, level: 'moderate', confidence: 'moderate' };
        }
        if (needSignals.low.some(s => messages.includes(s))) {
            return { score: 0.3, level: 'low', confidence: 'weak' };
        }

        return { score: 0.5, level: 'unknown', confidence: 'unknown' };
    },

    /**
     * Assess timeline qualification
     */
    assessTimeline(data) {
        const timelineSignals = {
            immediate: ['today', 'now', 'asap', 'immediately', 'this week'],
            short: ['this month', 'soon', 'next week', 'within 30 days'],
            medium: ['next quarter', 'in a few months', 'planning for'],
            long: ['next year', 'eventually', 'someday', 'just exploring'],
            unknown: []
        };

        const messages = data.messages.join(' ').toLowerCase();

        if (timelineSignals.immediate.some(s => messages.includes(s))) {
            return { score: 1.0, level: 'immediate', confidence: 'strong' };
        }
        if (timelineSignals.short.some(s => messages.includes(s))) {
            return { score: 0.8, level: 'short-term', confidence: 'strong' };
        }
        if (timelineSignals.medium.some(s => messages.includes(s))) {
            return { score: 0.6, level: 'medium-term', confidence: 'moderate' };
        }
        if (timelineSignals.long.some(s => messages.includes(s))) {
            return { score: 0.3, level: 'long-term', confidence: 'weak' };
        }

        return { score: 0.5, level: 'unknown', confidence: 'unknown' };
    },

    /**
     * Get recommendation based on BANT score
     */
    getRecommendation(score) {
        if (score >= 0.8) {
            return {
                action: 'close',
                priority: 'high',
                message: 'Strong qualification - move to close immediately'
            };
        }
        if (score >= 0.6) {
            return {
                action: 'present',
                priority: 'medium',
                message: 'Good qualification - present solution and handle objections'
            };
        }
        if (score >= 0.4) {
            return {
                action: 'nurture',
                priority: 'low',
                message: 'Weak qualification - continue discovery and nurture'
            };
        }
        return {
            action: 'disqualify',
            priority: 'none',
            message: 'Poor fit - politely disengage or educate'
        };
    }
};

/**
 * SPIN Selling Framework
 * Situation, Problem, Implication, Need-Payoff
 */
export const SPINFramework = {
    /**
     * Generate SPIN questions based on conversation stage
     * @param {string} stage - Current conversation stage
     * @param {Object} context - Page and user context
     * @returns {Array<string>} Suggested questions
     */
    generateQuestions(stage, context) {
        switch (stage) {
            case 'discovery':
                return this.situationQuestions(context);
            case 'qualification':
                return this.problemQuestions(context);
            case 'presentation':
                return this.implicationQuestions(context);
            case 'closing':
                return this.needPayoffQuestions(context);
            default:
                return this.situationQuestions(context);
        }
    },

    /**
     * Situation Questions - Understand current state
     */
    situationQuestions(context) {
        return [
            "What brings you here today?",
            "How are you currently handling customer inquiries?",
            "What tools are you using right now?",
            "How big is your team?",
            "What's your current process for [relevant area]?"
        ];
    },

    /**
     * Problem Questions - Identify pain points
     */
    problemQuestions(context) {
        return [
            "What challenges are you facing with your current solution?",
            "What's the biggest pain point in your workflow?",
            "How often does [problem] occur?",
            "What's frustrating about your current approach?",
            "Where are you losing the most time/money?"
        ];
    },

    /**
     * Implication Questions - Explore consequences
     */
    implicationQuestions(context) {
        return [
            "How does this problem affect your bottom line?",
            "What happens if this isn't solved?",
            "How much time are you losing to this issue?",
            "What's the cost of not fixing this?",
            "How is this impacting your team's productivity?"
        ];
    },

    /**
     * Need-Payoff Questions - Show value of solving
     */
    needPayoffQuestions(context) {
        return [
            "How would solving this improve your business?",
            "What would it mean to save [X hours/dollars]?",
            "How valuable would it be to [achieve outcome]?",
            "What could you do with the time/money saved?",
            "How would this help you reach your goals?"
        ];
    }
};

/**
 * Sales Conversation Stage Manager
 */
export class SalesStageManager {
    constructor() {
        this.stages = ['discovery', 'qualification', 'presentation', 'objection', 'closing'];
        this.currentStage = 'discovery';
        this.stageHistory = [];
    }

    /**
     * Detect conversation stage from messages
     * @param {Array<string>} messages - Conversation messages
     * @returns {string} Detected stage
     */
    detectStage(messages) {
        const lastMessage = messages[messages.length - 1].toLowerCase();
        const messageCount = messages.length;

        // Stage detection logic
        const stageIndicators = {
            discovery: {
                keywords: ['what', 'how', 'tell me', 'explain', 'show me', 'help'],
                minMessages: 0,
                maxMessages: 3
            },
            qualification: {
                keywords: ['price', 'cost', 'budget', 'team', 'when', 'timeline'],
                minMessages: 2,
                maxMessages: 10
            },
            presentation: {
                keywords: ['features', 'capabilities', 'how does', 'demo', 'show'],
                minMessages: 3,
                maxMessages: 15
            },
            objection: {
                keywords: ['but', 'however', 'expensive', 'not sure', 'concern', 'worried'],
                minMessages: 2,
                maxMessages: 20
            },
            closing: {
                keywords: ['sign up', 'get started', 'buy', 'purchase', 'trial', 'ready'],
                minMessages: 4,
                maxMessages: 100
            }
        };

        // Check each stage
        for (const [stage, indicators] of Object.entries(stageIndicators)) {
            const hasKeyword = indicators.keywords.some(kw => lastMessage.includes(kw));
            const inMessageRange = messageCount >= indicators.minMessages &&
                messageCount <= indicators.maxMessages;

            if (hasKeyword && inMessageRange) {
                this.updateStage(stage);
                return stage;
            }
        }

        // Default progression based on message count
        if (messageCount <= 2) return this.updateStage('discovery');
        if (messageCount <= 5) return this.updateStage('qualification');
        if (messageCount <= 10) return this.updateStage('presentation');
        return this.currentStage;
    }

    /**
     * Update current stage
     */
    updateStage(newStage) {
        if (newStage !== this.currentStage) {
            this.stageHistory.push({
                stage: this.currentStage,
                timestamp: Date.now()
            });
            this.currentStage = newStage;
        }
        return this.currentStage;
    }

    /**
     * Get stage-specific tactics
     */
    getStageTactics(stage) {
        const tactics = {
            discovery: {
                objective: 'Build rapport and understand needs',
                approach: 'Ask open-ended questions, listen actively',
                responseLength: 'short',
                questionRatio: 0.7 // 70% questions
            },
            qualification: {
                objective: 'Assess BANT criteria',
                approach: 'Qualify naturally through conversation',
                responseLength: 'medium',
                questionRatio: 0.5
            },
            presentation: {
                objective: 'Show relevant value',
                approach: 'Focus on benefits, provide proof',
                responseLength: 'medium',
                questionRatio: 0.3
            },
            objection: {
                objective: 'Address concerns',
                approach: 'Acknowledge, reframe, provide evidence',
                responseLength: 'medium',
                questionRatio: 0.4
            },
            closing: {
                objective: 'Ask for commitment',
                approach: 'Remove friction, create urgency',
                responseLength: 'short',
                questionRatio: 0.2
            }
        };

        return tactics[stage] || tactics.discovery;
    }

    /**
     * Get current stage info
     */
    getCurrentStageInfo() {
        return {
            stage: this.currentStage,
            tactics: this.getStageTactics(this.currentStage),
            history: this.stageHistory
        };
    }
}

/**
 * Integrated Sales Methodology
 */
export class SalesMethodology {
    constructor() {
        this.stageManager = new SalesStageManager();
    }

    /**
     * Analyze conversation and provide sales guidance
     * @param {Array<Object>} conversationHistory - Full conversation
     * @returns {Object} Sales guidance
     */
    analyze(conversationHistory) {
        // Extract user messages
        const userMessages = conversationHistory
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);

        // Detect stage
        const stage = this.stageManager.detectStage(userMessages);

        // Assess BANT
        const bantAssessment = BANTFramework.assess({
            messages: userMessages
        });

        // Get SPIN questions
        const spinQuestions = SPINFramework.generateQuestions(stage, {});

        // Get stage tactics
        const tactics = this.stageManager.getStageTactics(stage);

        return {
            stage,
            bant: bantAssessment,
            suggestedQuestions: spinQuestions,
            tactics,
            recommendation: this.getActionRecommendation(stage, bantAssessment)
        };
    }

    /**
     * Get action recommendation
     */
    getActionRecommendation(stage, bantAssessment) {
        if (bantAssessment.isQualified && stage === 'closing') {
            return {
                action: 'close_now',
                message: 'Strong qualification + closing stage = Ask for commitment',
                urgency: 'high'
            };
        }

        if (bantAssessment.isQualified && stage === 'presentation') {
            return {
                action: 'move_to_close',
                message: 'Qualified lead - transition to closing',
                urgency: 'medium'
            };
        }

        if (!bantAssessment.isQualified && stage === 'discovery') {
            return {
                action: 'continue_discovery',
                message: 'Continue qualifying through SPIN questions',
                urgency: 'low'
            };
        }

        return {
            action: 'follow_stage',
            message: `Continue with ${stage} tactics`,
            urgency: 'medium'
        };
    }
}
