/**
 * Sales Executive Integration
 * Integrates all sales components into a unified system
 */

import { SalesMethodology, BANTFramework, SPINFramework } from './methodology.js';
import { ClosingStatements, ULTIMATE_CLOSE, ClosingOptimizer } from './closing.js';
import { BestPersonalizationStrategy, PersonalizationEngine, PersonalizationRules } from './personalization.js';

/**
 * Sales Executive AI
 * Main controller for AI sales conversations
 */
export class SalesExecutiveAI {
    constructor() {
        this.methodology = new SalesMethodology();
        this.personalization = new BestPersonalizationStrategy();
        this.conversationHistory = [];
        this.behaviorData = {};
    }

    /**
     * Process user message and generate sales-optimized response
     * @param {string} userMessage - User's message
     * @param {Object} pageContext - Page context
     * @param {Object} behaviorData - User behavior data
     * @returns {Object} Sales response with actions
     */
    async processMessage(userMessage, pageContext, behaviorData = {}) {
        // Update conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Update behavior data
        this.behaviorData = { ...this.behaviorData, ...behaviorData };

        // Build/update user profile
        const userProfile = this.personalization.initialize(
            this.conversationHistory,
            this.behaviorData
        );

        // Analyze conversation with sales methodology
        const salesAnalysis = this.methodology.analyze(this.conversationHistory);

        // Generate base response (this would come from your AI API)
        // For now, we'll generate a sales-optimized prompt
        const salesPrompt = this.buildSalesPrompt(
            userMessage,
            salesAnalysis,
            userProfile,
            pageContext
        );

        return {
            salesPrompt,
            salesAnalysis,
            userProfile,
            personalization: this.personalization.getPersonalizationPackage(pageContext),
            recommendedActions: this.getRecommendedActions(salesAnalysis, userProfile, pageContext)
        };
    }

    /**
     * Build sales-optimized prompt for AI
     */
    buildSalesPrompt(userMessage, salesAnalysis, userProfile, pageContext) {
        const { stage, bant, tactics } = salesAnalysis;

        let prompt = `You are an elite AI sales executive. Current conversation stage: ${stage}\n\n`;

        // Add user profile context
        prompt += `USER PROFILE:\n`;
        prompt += `- Type: ${userProfile.type}\n`;
        prompt += `- Company Size: ${userProfile.companySize}\n`;
        prompt += `- Urgency: ${userProfile.urgency}\n`;
        prompt += `- Budget: ${userProfile.budget}\n`;
        if (userProfile.painPoints.length > 0) {
            prompt += `- Pain Points: ${userProfile.painPoints.join(', ')}\n`;
        }
        prompt += `\n`;

        // Add BANT assessment
        prompt += `QUALIFICATION (BANT):\n`;
        prompt += `- Budget: ${bant.budget.level} (${bant.budget.score})\n`;
        prompt += `- Authority: ${bant.authority.level} (${bant.authority.score})\n`;
        prompt += `- Need: ${bant.need.level} (${bant.need.score})\n`;
        prompt += `- Timeline: ${bant.timeline.level} (${bant.timeline.score})\n`;
        prompt += `- Overall Score: ${bant.totalScore.toFixed(2)} - ${bant.isQualified ? 'QUALIFIED' : 'NOT QUALIFIED'}\n`;
        prompt += `- Recommendation: ${bant.recommendation.message}\n\n`;

        // Add stage-specific tactics
        prompt += `STAGE TACTICS (${stage}):\n`;
        prompt += `- Objective: ${tactics.objective}\n`;
        prompt += `- Approach: ${tactics.approach}\n`;
        prompt += `- Response Length: ${tactics.responseLength}\n`;
        prompt += `- Question Ratio: ${(tactics.questionRatio * 100).toFixed(0)}%\n\n`;

        // Add SPIN questions for this stage
        const spinQuestions = SPINFramework.generateQuestions(stage, pageContext);
        prompt += `SUGGESTED QUESTIONS (SPIN):\n`;
        spinQuestions.forEach(q => prompt += `- ${q}\n`);
        prompt += `\n`;

        // Add personalization guidance
        const responseStyle = PersonalizationRules.getResponseStyle(userProfile);
        prompt += `PERSONALIZATION:\n`;
        prompt += `- Length: ${responseStyle.length}\n`;
        prompt += `- Tone: ${responseStyle.tone}\n`;
        prompt += `- Focus: ${responseStyle.focus}\n`;
        prompt += `- Questions: ${responseStyle.questions}\n\n`;

        // Add closing guidance if appropriate
        if (stage === 'closing' || bant.totalScore >= 0.7) {
            const closingContext = {
                userProfile,
                bantScore: bant.totalScore,
                objections: userProfile.objections,
                conversationLength: this.conversationHistory.length,
                pageContext
            };
            const closing = ClosingStatements.getBestClose(closingContext);

            prompt += `CLOSING GUIDANCE:\n`;
            prompt += `- Technique: ${closing.technique}\n`;
            prompt += `- Statement: "${closing.statement}"\n`;
            prompt += `- Follow-up: "${closing.followUp}"\n\n`;
        }

        // Add product knowledge
        if (pageContext.pricing) {
            prompt += `PRICING:\n`;
            pageContext.pricing.forEach(plan => {
                prompt += `- ${plan.name}: ${plan.price}\n`;
            });
            prompt += `\n`;
        }

        // Add response rules
        prompt += `RESPONSE RULES:\n`;
        prompt += `1. Match the ${responseStyle.tone} tone for this ${userProfile.type} user\n`;
        prompt += `2. Keep response ${responseStyle.length} (${this.getLengthGuidance(responseStyle.length)})\n`;
        prompt += `3. Focus on ${responseStyle.focus}\n`;
        prompt += `4. Include ${responseStyle.questions} questions\n`;
        prompt += `5. Reference their pain points when relevant\n`;
        prompt += `6. Use SPIN questioning technique\n`;
        prompt += `7. Follow ${stage} stage tactics\n`;
        prompt += `8. ${bant.isQualified ? 'Move toward closing' : 'Continue qualifying'}\n\n`;

        prompt += `Now respond to: "${userMessage}"`;

        return prompt;
    }

    /**
     * Get length guidance
     */
    getLengthGuidance(length) {
        const guidance = {
            short: '1-2 sentences, max 40 words',
            medium: '2-3 sentences, max 60 words',
            long: '3-4 sentences, max 80 words'
        };
        return guidance[length] || guidance.medium;
    }

    /**
     * Get recommended actions based on sales analysis
     */
    getRecommendedActions(salesAnalysis, userProfile, pageContext) {
        const actions = [];
        const { stage, bant } = salesAnalysis;

        // Navigation actions based on stage
        if (stage === 'qualification' || stage === 'presentation') {
            if (userProfile.interests.some(i => i.toLowerCase().includes('price'))) {
                actions.push({
                    type: 'navigate',
                    target: 'pricing',
                    priority: 'high'
                });
            }
            if (userProfile.interests.some(i => i.toLowerCase().includes('feature'))) {
                actions.push({
                    type: 'navigate',
                    target: 'features',
                    priority: 'medium'
                });
            }
        }

        // Closing actions
        if (stage === 'closing' || bant.totalScore >= 0.7) {
            actions.push({
                type: 'navigate',
                target: 'pricing',
                priority: 'high'
            });

            const recommendedPlan = PersonalizationRules.getRecommendedPlan(
                userProfile,
                pageContext.pricing
            );

            if (recommendedPlan) {
                actions.push({
                    type: 'focus',
                    target: recommendedPlan.name,
                    priority: 'high'
                });
            }

            actions.push({
                type: 'pulse_cta',
                target: 'signup button',
                priority: 'high'
            });
        }

        return actions;
    }

    /**
     * Get conversation insights
     */
    getInsights() {
        const salesAnalysis = this.methodology.analyze(this.conversationHistory);
        const userProfile = this.personalization.userProfile;

        return {
            stage: salesAnalysis.stage,
            bant: salesAnalysis.bant,
            userProfile,
            recommendation: salesAnalysis.recommendation,
            conversationLength: this.conversationHistory.length,
            qualified: salesAnalysis.bant.isQualified,
            readyToClose: salesAnalysis.stage === 'closing' && salesAnalysis.bant.totalScore >= 0.7
        };
    }

    /**
     * Reset conversation
     */
    reset() {
        this.conversationHistory = [];
        this.behaviorData = {};
        this.personalization = new BestPersonalizationStrategy();
    }
}

/**
 * Enhanced System Prompt Builder
 * Builds complete sales-optimized system prompts
 */
export function buildSalesSystemPrompt(pageContext, conversationHistory = []) {
    const salesAI = new SalesExecutiveAI();

    // If we have conversation history, analyze it
    if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            if (msg.role === 'user') {
                salesAI.conversationHistory.push(msg);
            }
        });
    }

    const userProfile = salesAI.personalization.initialize(
        salesAI.conversationHistory,
        {}
    );

    const salesAnalysis = salesAI.methodology.analyze(salesAI.conversationHistory);

    // Build comprehensive prompt
    let prompt = `You are Blitsum, an elite AI sales executive with 10+ years of enterprise sales experience.

CORE IDENTITY:
- Consultative, not pushy
- Value-focused, not feature-dumping  
- Curious about customer needs
- Confident but humble
- Results-oriented

COMMUNICATION STYLE:
- Warm and professional
- Ask questions before pitching
- Use customer's language
- Short sentences for clarity
- Always end with a question or clear CTA

`;

    // Add current stage and tactics
    if (conversationHistory.length > 0) {
        const { stage, tactics } = salesAnalysis;
        prompt += `CURRENT STAGE: ${stage.toUpperCase()}\n`;
        prompt += `Objective: ${tactics.objective}\n`;
        prompt += `Approach: ${tactics.approach}\n\n`;
    }

    // Add user profile if available
    if (userProfile && userProfile.type !== 'unknown') {
        prompt += `USER PROFILE:\n`;
        prompt += `- Type: ${userProfile.type}\n`;
        prompt += `- Company: ${userProfile.companySize}\n`;
        prompt += `- Urgency: ${userProfile.urgency}\n\n`;
    }

    // Add page context
    if (pageContext.pricing && pageContext.pricing.length > 0) {
        prompt += `PRICING (GROUND TRUTH):\n`;
        pageContext.pricing.forEach(plan => {
            prompt += `- ${plan.name}: ${plan.price}`;
            if (plan.popular) prompt += ` (MOST POPULAR)`;
            prompt += `\n`;
        });
        prompt += `\n`;
    }

    if (pageContext.features && pageContext.features.length > 0) {
        prompt += `KEY FEATURES:\n`;
        pageContext.features.slice(0, 5).forEach(feature => {
            prompt += `- ${feature.name}: ${feature.description}\n`;
        });
        prompt += `\n`;
    }

    // Add sales methodology
    prompt += `SALES METHODOLOGY (BANT + SPIN):
- Qualify: Budget, Authority, Need, Timeline
- Question: Situation → Problem → Implication → Need-Payoff
- Present: Benefits over features, provide proof
- Close: Remove friction, create urgency

`;

    // Add closing guidance if qualified
    if (salesAnalysis.bant && salesAnalysis.bant.isQualified) {
        prompt += `⚠️ USER IS QUALIFIED - Move toward closing!\n`;
        prompt += `Ultimate Close: "${ULTIMATE_CLOSE.statement}"\n\n`;
    }

    // Add response rules
    prompt += `RESPONSE RULES:
1. Keep responses under 60 words
2. Always end with a question or CTA
3. Focus on benefits, not features
4. Provide proof when making claims
5. Use actions to enhance experience
6. Never hallucinate - use only page context
7. Match user's tone and urgency

AVAILABLE ACTIONS:
- {"action": "scroll", "section": "pricing"} - Navigate to section
- {"action": "highlight", "element": ".plan-card"} - Highlight element
- {"action": "pulse_cta", "element": ".signup-btn"} - Animate CTA

Now respond as an elite sales executive, following the methodology and stage tactics above.
`;

    return prompt;
}
