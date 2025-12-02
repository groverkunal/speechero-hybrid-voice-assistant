import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';

export class LocalLLMService {
    constructor() {
        this.llm = null;
        this.isReady = false;
    }

    async initialize(modelPath = '/gemma2-2b-it-gpu-int8.bin') {
        if (this.llm) return;

        try {
            const genaiFileset = await FilesetResolver.forGenAiTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
            );

            this.llm = await LlmInference.createFromOptions(genaiFileset, {
                baseOptions: {
                    modelAssetPath: modelPath,
                },
                maxTokens: 1000,
                topK: 40,
                temperature: 0.8,
                randomSeed: 101
            });

            this.isReady = true;
            console.log("Local LLM Initialized");
        } catch (error) {
            console.error("Failed to initialize Local LLM:", error);
            throw error;
        }
    }

    async generateQuestion(transcript) {
        if (!this.llm) {
            throw new Error("Local LLM not initialized");
        }

        const prompt = `You are a precise query generator. Your ONLY task is to convert the user's spoken input into a short, effective search query.
    
Rules:
1. Output ONLY the search query.
2. Do NOT include explanations, reasoning, or extra text.
3. Do NOT use markdown formatting.

User Input: "${transcript}"

Search Query:`;

        return this.llm.generateResponse(prompt);
    }
}

export const localLLM = new LocalLLMService();
