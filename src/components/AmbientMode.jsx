import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeechService } from '../services/stt';
import { AgentOrchestrator } from '../services/multi-agent';
import FactCard from './FactCard';

const AmbientMode = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [facts, setFacts] = useState([]);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBmHXt97psw0E7uzJ5_YXTwfTp8exjXGmQ");
    const [processing, setProcessing] = useState(false);
    const [debugStatus, setDebugStatus] = useState('Idle');

    const speechService = useRef(null);
    const orchestrator = useRef(null);
    const transcriptBuffer = useRef('');
    const processingTimeout = useRef(null);

    useEffect(() => {
        // Initialize Speech Service
        speechService.current = new SpeechService(
            (result) => {
                if (result.final) {
                    const newText = result.final.trim();
                    if (newText) {
                        setDebugStatus(`📝 Got text: "${newText.substring(0, 30)}..."`);
                        transcriptBuffer.current += ' ' + newText;
                        setTranscript(prev => [...prev, { text: newText, timestamp: Date.now() }]);

                        // Debounce: Wait 2 seconds after speech before analyzing
                        clearTimeout(processingTimeout.current);
                        setDebugStatus('⏰ Waiting 2s to analyze...');
                        processingTimeout.current = setTimeout(() => {
                            setDebugStatus('🔍 Analyzing now...');
                            analyzeBuffer();
                        }, 2000);
                    }
                }
            },
            () => {
                setDebugStatus('🔄 STT restarting...');
            }
        );

        return () => {
            speechService.current?.stop();
            clearTimeout(processingTimeout.current);
        };
    }, []);

    useEffect(() => {
        if (apiKey) {
            orchestrator.current = new AgentOrchestrator(apiKey);
            localStorage.setItem('gemini_api_key', apiKey);
            setDebugStatus('☁️ Multi-agent ready!');
        }
    }, [apiKey]);

    // Persist transcript to localStorage
    useEffect(() => {
        if (transcript.length > 0) {
            localStorage.setItem('session_transcript', JSON.stringify(transcript.slice(-50))); // Keep last 50
        }
    }, [transcript]);

    // Persist facts to localStorage
    useEffect(() => {
        if (facts.length > 0) {
            localStorage.setItem('session_facts', JSON.stringify(facts.slice(-20))); // Keep last 20
        }
    }, [facts]);

    // Load previous session on mount
    useEffect(() => {
        const savedTranscript = localStorage.getItem('session_transcript');
        const savedFacts = localStorage.getItem('session_facts');

        if (savedTranscript) {
            try {
                setTranscript(JSON.parse(savedTranscript));
            } catch (e) {
                console.error('Failed to restore transcript:', e);
            }
        }

        if (savedFacts) {
            try {
                setFacts(JSON.parse(savedFacts));
            } catch (e) {
                console.error('Failed to restore facts:', e);
            }
        }
    }, []);

    useEffect(() => {
        if (apiKey) {
            // cloudLLM.current = new CloudLLMService(apiKey); // This line is no longer needed
            localStorage.setItem('gemini_api_key', apiKey);
        }
    }, [apiKey]);

    const analyzeBuffer = async () => {
        const buffer = transcriptBuffer.current.trim();
        if (!buffer || processing) {
            setDebugStatus(processing ? '⏳ Already processing...' : '🤷 Buffer empty');
            return;
        }

        if (!orchestrator.current) {
            setDebugStatus('❌ No API key - please add one above');
            return;
        }

        setProcessing(true);
        setDebugStatus('🤖 Curious Agent thinking...');
        try {
            // Multi-agent orchestration
            const results = await orchestrator.current.processTranscript(buffer);

            if (results.length === 0) {
                setDebugStatus('💬 Just casual chat - no facts needed');
            } else {
                setDebugStatus(`✨ Found ${results.length} interesting fact(s)!`);

                //Add facts to UI
                results.forEach(({ question, answer }) => {
                    setFacts(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        query: question,
                        answer,
                        timestamp: Date.now()
                    }]);
                });
            }

            transcriptBuffer.current = '';
            setTimeout(() => setDebugStatus('Idle'), 2000);
        } catch (error) {
            console.error('Multi-agent error:', error);
            setDebugStatus(`❌ Error: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            speechService.current.stop();
            setIsListening(false);
        } else {
            speechService.current.start();
            setIsListening(true);
        }
    };

    const dismissFact = (id) => {
        setFacts(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="min-h-screen flex flex-col p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
            >
                <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Curious AI
                </h1>
                <p className="text-gray-400 text-sm">Multi-Agent Intelligence · Listening & Learning in Real-Time</p>
            </motion.div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mb-6">
                <button
                    onClick={toggleListening}
                    disabled={!apiKey}
                    className={`px-6 py-2 rounded-full flex items-center gap-2 transition-all ${isListening
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:scale-105'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>

                {processing && (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing...
                    </div>
                )}

                <div className="text-xs text-gray-500 px-3 py-1 bg-black/20 rounded-full">
                    {debugStatus}
                </div>
            </div>

            {/* API Key Input */}
            {!apiKey && (
                <div className="max-w-md mx-auto mb-6 glass-panel p-4 rounded-xl flex gap-2">
                    <input
                        type="password"
                        placeholder="Enter Gemini API Key"
                        className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-500"
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>
            )}

            {/* Main Content: Split View */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
                {/* Left: Live Transcript */}
                <div className="glass-panel rounded-2xl p-6 overflow-hidden flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Mic size={18} className={isListening ? 'text-green-400 animate-pulse' : 'text-gray-400'} />
                        Live Transcript
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {transcript.length === 0 ? (
                            <p className="text-gray-500 text-center mt-8">
                                {isListening ? 'Listening...' : 'Start listening to see transcript'}
                            </p>
                        ) : (
                            <AnimatePresence>
                                {transcript.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <p className="text-white">{item.text}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Right: Fact Stream */}
                <div className="glass-panel rounded-2xl p-6 overflow-hidden flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Fact Stream
                    </h2>
                    <div className="flex-1 overflow-y-auto">
                        {facts.length === 0 ? (
                            <p className="text-gray-500 text-center mt-8">
                                Facts will appear here when needed
                            </p>
                        ) : (
                            <AnimatePresence>
                                {facts.map((fact) => (
                                    <FactCard
                                        key={fact.id}
                                        query={fact.query}
                                        answer={fact.answer}
                                        onDismiss={() => dismissFact(fact.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmbientMode;
