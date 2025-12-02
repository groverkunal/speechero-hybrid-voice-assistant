export class SpeechService {
    constructor(onResult, onEnd) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            onResult({ final: finalTranscript, interim: interimTranscript });
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
        };

        this.recognition.onend = () => {
            if (onEnd) onEnd();
        };
    }

    start() {
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (e) {
                console.error("Error starting recognition:", e);
            }
        }
    }

    stop() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}
