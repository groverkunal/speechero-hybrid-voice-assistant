export class AgentOrchestrator {
    constructor(apiKey) {
        // API Key is no longer used on the client
        this.conversationHistory = [];
    }

    addToHistory(text) {
        this.conversationHistory.push(text);
        // Keep only last 20 entries
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    async processTranscript(transcript) {
        // Add to shared memory on client side
        this.addToHistory(transcript);

        try {
            const response = await fetch('/api/process-transcript', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcript,
                    history: this.conversationHistory
                }),
            });

            if (!response.ok) {
                console.error('Server responded with error:', response.status);
                return [];
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error calling agent API:', error);
            return [];
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}
