import { GoogleGenerativeAI } from "@google/generative-ai";

export class CloudLLMService {
    constructor(apiKey) {
        if (!apiKey) {
            console.warn("No API Key provided for Cloud LLM");
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }

    async getAnswer(question) {
        if (!this.model) {
            throw new Error("Cloud LLM not initialized (missing API Key)");
        }

        try {
            // Wrap the question with instruction for brevity
            const prompt = `${question}\n\nProvide a BRIEF, factual answer (2-3 sentences max, news-ticker style). Focus on key stats and facts only.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error fetching answer from Cloud LLM:", error);
            throw error;
        }
    }
}
