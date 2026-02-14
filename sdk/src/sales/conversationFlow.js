/**
 * Conversation Flow Manager
 * Guides users through structured sales conversation stages
 */

export const ConversationStage = {
    GREETING: 'greeting',
    DISCOVERY: 'discovery',
    QUALIFICATION: 'qualification',
    PRESENTATION: 'presentation',
    OBJECTION: 'objection',
    CLOSING: 'closing',
    COMPLETED: 'completed'
};

export class ConversationFlowManager {
    constructor() {
        this.currentStage = ConversationStage.GREETING;
        this.stageHistory = [ConversationStage.GREETING];
        this.stageData = {};
        this.conversationStartTime = Date.now();
    }

    /**
     * Detect conversation stage from user message and history
     */
    detectStage(userMessage, conversationHistory) {
        const message = userMessage.toLowerCase();

        // High-intent signals - jump to closing
        const closingSignals = ['sign up', 'get started', 'buy', 'purchase', 'trial', 'subscribe', 'join'];
        if (closingSignals.some(signal => message.includes(signal))) {
            return ConversationStage.CLOSING;
        }

        // Objection signals
        const objectionSignals = ['but', 'however', 'expensive', 'not sure', 'concern', 'worried', 'doubt', 'hesitant'];
        if (objectionSignals.some(signal => message.includes(signal))) {
            return ConversationStage.OBJECTION;
        }

        // Qualification signals
        const qualificationSignals = ['price', 'cost', 'how much', 'budget', 'when', 'timeline', 'team size'];
        if (qualificationSignals.some(signal => message.includes(signal))) {
            return ConversationStage.QUALIFICATION;
        }

        // Presentation signals
        const presentationSignals = ['features', 'how does', 'show me', 'demo', 'capabilities', 'what can'];
        if (presentationSignals.some(signal => message.includes(signal))) {
            return ConversationStage.PRESENTATION;
        }

        // Discovery signals
        const discoverySignals = ['what', 'tell me', 'explain', 'help', 'looking for', 'need'];
        if (discoverySignals.some(signal => message.includes(signal))) {
            return ConversationStage.DISCOVERY;
        }

        // Default progression based on conversation length
        const messageCount = conversationHistory.filter(m => m.role === 'user').length;

        if (messageCount === 0) return ConversationStage.GREETING;
        if (messageCount === 1) return ConversationStage.DISCOVERY;
        if (messageCount === 2) return ConversationStage.QUALIFICATION;
        if (messageCount >= 3) return ConversationStage.PRESENTATION;

        return this.currentStage;
    }

    /**
     * Advance to next stage
     */
    advanceStage(userMessage, conversationHistory) {
        const detectedStage = this.detectStage(userMessage, conversationHistory);

        // Allow stage progression or objection handling
        if (detectedStage !== this.currentStage) {
            this.currentStage = detectedStage;
            this.stageHistory.push(detectedStage);
            console.log(`[ConversationFlow] Advanced to stage: ${detectedStage}`);
        }

        return this.currentStage;
    }

    /**
     * Get stage objectives
     */
    getStageObjectives(stage = this.currentStage) {
        const objectives = {
            [ConversationStage.GREETING]: {
                primary: 'Build rapport and establish trust',
                secondary: 'Understand why they\'re here',
                tactics: ['Be warm and welcoming', 'Ask open-ended question', 'Show genuine interest']
            },
            [ConversationStage.DISCOVERY]: {
                primary: 'Understand their situation and pain points',
                secondary: 'Identify their needs',
                tactics: ['Ask about current challenges', 'Listen actively', 'Identify pain points', 'Avoid pitching']
            },
            [ConversationStage.QUALIFICATION]: {
                primary: 'Assess BANT (Budget, Authority, Need, Timeline)',
                secondary: 'Determine if they\'re a good fit',
                tactics: ['Ask about timeline', 'Gauge budget level', 'Identify decision-makers', 'Assess urgency']
            },
            [ConversationStage.PRESENTATION]: {
                primary: 'Show relevant features and value',
                secondary: 'Create desire',
                tactics: ['Focus on benefits not features', 'Use their words', 'Provide proof', 'Show don\'t tell']
            },
            [ConversationStage.OBJECTION]: {
                primary: 'Address concerns and remove barriers',
                secondary: 'Build confidence',
                tactics: ['Acknowledge concern', 'Reframe objection', 'Provide evidence', 'Offer alternatives']
            },
            [ConversationStage.CLOSING]: {
                primary: 'Ask for commitment',
                secondary: 'Make it easy to say yes',
                tactics: ['Create urgency', 'Remove friction', 'Assumptive close', 'Direct ask']
            },
            [ConversationStage.COMPLETED]: {
                primary: 'Ensure smooth onboarding',
                secondary: 'Set expectations',
                tactics: ['Confirm next steps', 'Provide resources', 'Thank them']
            }
        };

        return objectives[stage] || objectives[ConversationStage.DISCOVERY];
    }

    /**
     * Get stage-specific prompt guidance
     */
    getStagePrompt(stage = this.currentStage) {
        const prompts = {
            [ConversationStage.GREETING]: `
CURRENT STAGE: Greeting

OBJECTIVES:
- Build rapport
- Establish trust
- Understand their intent

RESPONSE GUIDELINES:
- Be warm and welcoming
- Keep it brief (1-2 sentences)
- End with an open-ended question
- Don't pitch yet

EXAMPLE RESPONSES:
- "Hi! Welcome. What brings you here today?"
- "Hello! I'm here to help. What are you looking for?"
- "Hey there! How can I assist you today?"
`,

            [ConversationStage.DISCOVERY]: `
CURRENT STAGE: Discovery

OBJECTIVES:
- Understand their situation
- Identify pain points
- Qualify interest level

RESPONSE GUIDELINES:
- Ask open-ended questions
- Listen more than you talk
- Show genuine curiosity
- Avoid pitching too early

EXAMPLE QUESTIONS:
- "What challenges are you facing with [their current solution]?"
- "How are you currently handling [problem area]?"
- "What would an ideal solution look like for you?"
- "What's the biggest pain point you're trying to solve?"
`,

            [ConversationStage.QUALIFICATION]: `
CURRENT STAGE: Qualification

OBJECTIVES:
- Assess BANT criteria
- Determine fit
- Gauge urgency

RESPONSE GUIDELINES:
- Ask qualifying questions naturally
- Don't interrogate
- Position questions as helping them
- Listen for buying signals

EXAMPLE QUESTIONS:
- "What's your timeline for implementing a solution?"
- "Who else is involved in this decision?"
- "What's your budget range for this?"
- "What happens if you don't solve this problem soon?"
`,

            [ConversationStage.PRESENTATION]: `
CURRENT STAGE: Presentation

OBJECTIVES:
- Show relevant features
- Demonstrate value
- Provide social proof

RESPONSE GUIDELINES:
- Focus on benefits, not features
- Use their words back to them
- Show, don't just tell (use actions)
- Provide specific examples

RESPONSE STRUCTURE:
1. Acknowledge their need
2. Present relevant solution
3. Show proof/example
4. Check understanding

EXAMPLE:
"I hear you - speed is critical. Our AI delivers responses in under 200ms, 10x faster than traditional chatbots. Companies like [example] saw 40% higher engagement. Want to see it in action?"
`,

            [ConversationStage.OBJECTION]: `
CURRENT STAGE: Objection Handling

OBJECTIVES:
- Address concerns
- Remove barriers
- Build confidence

RESPONSE FRAMEWORK:
1. Acknowledge: "I understand [concern]"
2. Reframe: "Let's look at [alternative perspective]"
3. Evidence: "Customers typically see [proof point]"
4. Alternative: "We also have [option]"

COMMON OBJECTIONS:
- Price: Reframe as ROI, offer starter plan
- Timing: Create urgency, offer low-risk trial
- Authority: Facilitate decision process
- Competitor: Differentiate, show unique value
- Skepticism: Provide proof, risk reversal
`,

            [ConversationStage.CLOSING]: `
CURRENT STAGE: Closing

OBJECTIVES:
- Ask for commitment
- Remove final barriers
- Make it easy to say yes

CLOSING TECHNIQUES:
1. Assumptive: "Which plan works best - Starter or Pro?"
2. Alternative: "Monthly or annual billing?"
3. Urgency: "20% discount ends Friday"
4. Trial: "Does this address your concerns?"
5. Direct: "Ready to get started?"

RESPONSE GUIDELINES:
- Be confident but not pushy
- Create urgency
- Remove friction
- Use actions (pulse CTA, highlight plan)

EXAMPLE:
"Perfect! You'll get [benefits]. We can have you set up in 5 minutes with our free trial - no credit card needed. Ready to start?"
`
        };

        return prompts[stage] || prompts[ConversationStage.DISCOVERY];
    }

    /**
     * Check if should advance to next stage
     */
    shouldAdvanceStage(conversationHistory) {
        const userMessages = conversationHistory.filter(m => m.role === 'user');
        const currentStageIndex = Object.values(ConversationStage).indexOf(this.currentStage);

        // Don't auto-advance from objection or closing
        if (this.currentStage === ConversationStage.OBJECTION ||
            this.currentStage === ConversationStage.CLOSING) {
            return false;
        }

        // Advance after 2-3 exchanges in current stage
        const messagesInStage = userMessages.length - this.stageHistory.length + 1;
        return messagesInStage >= 2;
    }

    /**
     * Get next recommended stage
     */
    getNextStage() {
        const stageOrder = [
            ConversationStage.GREETING,
            ConversationStage.DISCOVERY,
            ConversationStage.QUALIFICATION,
            ConversationStage.PRESENTATION,
            ConversationStage.CLOSING,
            ConversationStage.COMPLETED
        ];

        const currentIndex = stageOrder.indexOf(this.currentStage);
        if (currentIndex < stageOrder.length - 1) {
            return stageOrder[currentIndex + 1];
        }

        return ConversationStage.COMPLETED;
    }

    /**
     * Store stage-specific data
     */
    setStageData(key, value) {
        if (!this.stageData[this.currentStage]) {
            this.stageData[this.currentStage] = {};
        }
        this.stageData[this.currentStage][key] = value;
    }

    /**
     * Get stage-specific data
     */
    getStageData(key, stage = this.currentStage) {
        return this.stageData[stage]?.[key];
    }

    /**
     * Get conversation duration
     */
    getConversationDuration() {
        return Math.floor((Date.now() - this.conversationStartTime) / 1000);
    }

    /**
     * Get conversation summary
     */
    getSummary() {
        return {
            currentStage: this.currentStage,
            stageHistory: this.stageHistory,
            duration: this.getConversationDuration(),
            stageData: this.stageData
        };
    }

    /**
     * Reset conversation flow
     */
    reset() {
        this.currentStage = ConversationStage.GREETING;
        this.stageHistory = [ConversationStage.GREETING];
        this.stageData = {};
        this.conversationStartTime = Date.now();
    }
}

// Export singleton instance
export const conversationFlow = new ConversationFlowManager();
