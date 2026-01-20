import { GoogleGenerativeAI } from "@google/generative-ai";

export class CuriousAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }

    async generateQuestions(transcript, conversationHistory = []) {
        const historyText = conversationHistory.length > 0
            ? `\n\nConversation history:\n${conversationHistory.join('\n')}`
            : '';

        const prompt = `You are a curious AI assistant listening to a conversation. Your job is to identify interesting factual questions that would enrich the discussion.

Current transcript: "${transcript}"${historyText}

Instructions:
- If the conversation mentions facts, statistics, or claims that could be verified or expanded, generate 1-2 specific questions
- Questions should be concise and factual
- If it's just casual chat with no factual content, output EXACTLY: NULL
- Output questions as a JSON array of strings

Examples:
- "I heard AI replaced thousands of jobs" → ["How many jobs has AI automation displaced in 2024?"]
- "ChatGPT is so expensive to run" → ["What is the cost per query for ChatGPT?", "How much does OpenAI spend on infrastructure?"]
- "Hey, how are you?" → NULL

Output (JSON array or NULL):`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response.text().trim();

            if (response === 'NULL' || response.toLowerCase().includes('null')) {
                return [];
            }

            // Clean up code blocks if present
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Curious Agent error:', error);
            return [];
        }
    }
}

export class ResearcherAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }

    async answerQuestion(question, conversationHistory = []) {
        const historyContext = conversationHistory.length > 0
            ? `\n\nContext from conversation:\n${conversationHistory.slice(-5).join('\n')}`
            : '';

        const prompt = `${question}${historyContext}\n\nProvide a BRIEF, factual answer (2-3 sentences max). Focus on key stats and facts.`;

        try {
            const result = await this.model.generateContent(prompt);
            return await result.response.text();
        } catch (error) {
            console.error('Researcher Agent error:', error);
            throw error;
        }
    }
}

export class AgentOrchestrator {
    constructor(apiKey) {
        this.curiousAgent = new CuriousAgent(apiKey);
        this.researcherAgent = new ResearcherAgent(apiKey);
    }

    async processTranscript(transcript, history = []) {
        // Step 1: Curious Agent generates questions
        const questions = await this.curiousAgent.generateQuestions(
            transcript,
            history
        );

        if (questions.length === 0) {
            return []; // No interesting questions
        }

        // Step 2: Researcher Agents answer each question
        const results = [];
        for (const question of questions) {
            try {
                const answer = await this.researcherAgent.answerQuestion(
                    question,
                    history
                );
                results.push({ question, answer });
            } catch (error) {
                console.error(`Failed to answer: ${question}`, error);
            }
        }

        return results;
    }
}
