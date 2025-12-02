import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';

export class LocalLLMService {
    constructor() {
        this.llm = null;
        this.isReady = false;
    }

    async initialize(modelPath = '/gemma2-2b-it-gpu-int8.bin') {
        if (this.llm) return;

        const startTime = Date.now();
        console.log('🚀 [LocalLLM] Starting initialization...');

        try {
            console.log('📦 [LocalLLM] Loading WASM...');
            const genaiFileset = await FilesetResolver.forGenAiTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
            );
            console.log(`✅ [LocalLLM] WASM loaded in ${Date.now() - startTime}ms`);

            console.log('🧠 [LocalLLM] Loading model from:', modelPath);
            console.log('📊 [LocalLLM] Model size: ~2.4GB, this may take a while...');

            const modelStartTime = Date.now();
            this.llm = await LlmInference.createFromOptions(genaiFileset, {
                baseOptions: {
                    modelAssetPath: modelPath,
                },
                maxTokens: 1000,
                topK: 40,
                temperature: 0.8,
                randomSeed: 101
            });

            const totalTime = Date.now() - startTime;
            const modelTime = Date.now() - modelStartTime;
            console.log(`✅ [LocalLLM] Model loaded in ${modelTime}ms`);
            console.log(`✅ [LocalLLM] Total initialization: ${totalTime}ms`);

            this.isReady = true;
        } catch (error) {
            console.error('❌ [LocalLLM] Initialization failed:', error);
            console.error('❌ [LocalLLM] Error details:', {
                message: error.message,
                stack: error.stack,
                modelPath
            });
            throw error;
        }
    }

    async analyzeConversation(transcript) {
        if (!this.llm) {
            throw new Error("Local LLM not initialized");
        }

        const prompt = `You are an intelligent conversation analyst. Your job is to listen to conversations and detect when factual information is needed.

Analyze this conversation snippet:
"${transcript}"

Instructions:
1. If the conversation contains a factual question, dispute, or need for statistics/data, output ONLY a concise search query.
2. If it's just casual chat, greetings, or opinions, output exactly: NULL

Examples:
- "I wonder how many jobs AI replaced in 2024" -> "AI job displacement statistics 2024"
- "Hey, how are you?" -> NULL
- "What percentage of companies use AI?" -> "percentage of companies using AI"
- "I love pizza" -> NULL

Output:`;

        const response = await this.llm.generateResponse(prompt);
        const cleanResponse = response.trim();

        // Return null if the model says there's no factual need
        if (cleanResponse === 'NULL' || cleanResponse.toLowerCase().includes('null')) {
            return null;
        }

        return cleanResponse;
    }

    // Keep old method for backwards compatibility
    async generateQuestion(transcript) {
        return this.analyzeConversation(transcript);
    }
}

export const localLLM = new LocalLLMService();
