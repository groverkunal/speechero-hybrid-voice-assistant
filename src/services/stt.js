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
        this.isExplicitStop = false;

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
            // Auto-restart on error if not explicitly stopped
            if (!this.isExplicitStop && event.error !== 'not-allowed') {
                setTimeout(() => this.start(), 1000);
            }
        };

        this.recognition.onend = () => {
            if (onEnd) onEnd();
            // Auto-restart if not explicitly stopped
            if (!this.isExplicitStop) {
                console.log("Speech recognition ended, restarting...");
                this.start();
            }
        };
    }

    start() {
        this.isExplicitStop = false;
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (e) {
                // Ignore error if already started
            }
        }
    }

    stop() {
        this.isExplicitStop = true;
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}
