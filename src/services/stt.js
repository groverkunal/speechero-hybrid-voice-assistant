export class SpeechService {
    constructor(onResult, onEnd) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API not supported in this browser.");
            return;
        }

        this.onResult = onResult;
        this.onEnd = onEnd;
        this.isExplicitStop = false;
        this.restartAttempts = 0;
        this.maxRestartDelay = 3000;
        this.lastResultTime = Date.now();

        this.initRecognition();
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            this.lastResultTime = Date.now();
            this.restartAttempts = 0; // Reset on successful result

            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            this.onResult({ final: finalTranscript, interim: interimTranscript });
        };

        this.recognition.onerror = (event) => {
            console.warn("Speech recognition error:", event.error);

            // Don't restart on permission errors
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                console.error("Microphone permission denied");
                return;
            }

            // Handle network errors gracefully
            if (event.error === 'network') {
                console.warn("Network error, will retry...");
            }

            // Auto-restart with exponential backoff
            if (!this.isExplicitStop) {
                this.scheduleRestart();
            }
        };

        this.recognition.onend = () => {
            if (this.onEnd) this.onEnd();

            // Auto-restart if not explicitly stopped
            if (!this.isExplicitStop) {
                // Quick restart if we were actively receiving results
                const timeSinceLastResult = Date.now() - this.lastResultTime;
                if (timeSinceLastResult < 5000) {
                    // Recent activity, restart immediately
                    this.restartAttempts = 0;
                    setTimeout(() => this.start(), 100);
                } else {
                    this.scheduleRestart();
                }
            }
        };
    }

    scheduleRestart() {
        this.restartAttempts++;
        // Exponential backoff: 100ms, 200ms, 400ms, etc., capped at maxRestartDelay
        const delay = Math.min(100 * Math.pow(2, this.restartAttempts - 1), this.maxRestartDelay);
        console.log(`Scheduling STT restart in ${delay}ms (attempt ${this.restartAttempts})`);
        setTimeout(() => this.start(), delay);
    }

    start() {
        this.isExplicitStop = false;
        if (this.recognition) {
            try {
                this.recognition.start();
                console.log("Speech recognition started");
            } catch (e) {
                // Already started or other error
                if (e.name === 'InvalidStateError') {
                    // Recognition already running, that's fine
                } else {
                    console.warn("Error starting recognition:", e);
                    this.scheduleRestart();
                }
            }
        }
    }

    stop() {
        this.isExplicitStop = true;
        this.restartAttempts = 0;
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore stop errors
            }
        }
    }
}
