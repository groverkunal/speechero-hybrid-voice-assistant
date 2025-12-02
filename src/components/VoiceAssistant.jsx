import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeechService } from '../services/stt';
import { localLLM } from '../services/local-llm';
import { CloudLLMService } from '../services/cloud-llm';

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('idle'); // idle, listening, thinking, fetching, result
    const [generatedQuestion, setGeneratedQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '');
    const [modelReady, setModelReady] = useState(false);

    const speechService = useRef(null);
    const cloudLLM = useRef(null);

    useEffect(() => {
        // Initialize Local LLM
        localLLM.initialize().then(() => setModelReady(true)).catch(console.error);

        // Initialize Speech Service
        speechService.current = new SpeechService(
            (result) => {
                setTranscript(result.final || result.interim);
                if (result.final) {
                    handleFinalTranscript(result.final);
                }
            },
            () => setIsListening(false)
        );

        return () => speechService.current?.stop();
    }, []);

    useEffect(() => {
        if (apiKey) {
            cloudLLM.current = new CloudLLMService(apiKey);
            localStorage.setItem('gemini_api_key', apiKey);
        }
    }, [apiKey]);

    const handleFinalTranscript = async (text) => {
        speechService.current.stop();
        setIsListening(false);
        setStatus('thinking');

        try {
            // 1. Local LLM generates question
            const question = await localLLM.generateQuestion(text);
            setGeneratedQuestion(question);
            setStatus('fetching');

            // 2. Cloud LLM fetches answer
            if (cloudLLM.current) {
                const result = await cloudLLM.current.getAnswer(question);
                setAnswer(result);
                setStatus('result');
            } else {
                setAnswer("Please provide a Gemini API Key to get answers.");
                setStatus('result');
            }
        } catch (error) {
            console.error(error);
            setAnswer("Something went wrong in the pipeline.");
            setStatus('result');
        }
    };

    const toggleListening = () => {
        if (isListening) {
            speechService.current.stop();
            setIsListening(false);
        } else {
            setTranscript('');
            setAnswer('');
            setGeneratedQuestion('');
            setStatus('listening');
            speechService.current.start();
            setIsListening(true);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-2xl w-full z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        Speechero
                    </h1>
                    <p className="text-gray-400">Hybrid Local + Cloud Intelligence</p>
                </motion.div>

                {/* API Key Input (if missing) */}
                {!apiKey && (
                    <div className="mb-8 glass-panel p-4 rounded-xl flex gap-2">
                        <input
                            type="password"
                            placeholder="Enter Gemini API Key"
                            className="bg-transparent border-none outline-none flex-1 text-white placeholder-gray-500"
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                )}

                {/* Main Interaction Area */}
                <div className="glass-panel rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center relative">

                    {/* Status Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${modelReady ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-400">{modelReady ? 'Local Model Ready' : 'Loading Model...'}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <button
                                    onClick={toggleListening}
                                    disabled={!modelReady}
                                    className={`p-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Mic size={48} className="text-white" />
                                </button>
                                <p className="mt-4 text-gray-300">Tap to speak</p>
                            </motion.div>
                        )}

                        {status === 'listening' && (
                            <motion.div
                                key="listening"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center w-full"
                            >
                                <div className="mb-8 relative">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                                    <Mic size={64} className="text-blue-400 relative z-10 mx-auto" />
                                </div>
                                <p className="text-2xl font-light text-white mb-4">"{transcript}"</p>
                                <button onClick={toggleListening} className="text-sm text-gray-400 hover:text-white">
                                    Stop Listening
                                </button>
                            </motion.div>
                        )}

                        {status === 'thinking' && (
                            <motion.div
                                key="thinking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <BrainCircuit size={64} className="text-purple-400 mx-auto mb-6 animate-pulse" />
                                <h3 className="text-xl font-semibold text-white mb-2">Processing Locally...</h3>
                                <p className="text-gray-400">Formulating query from speech</p>
                            </motion.div>
                        )}

                        {status === 'fetching' && (
                            <motion.div
                                key="fetching"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <Sparkles size={64} className="text-yellow-400 mx-auto mb-6 animate-spin-slow" />
                                <h3 className="text-xl font-semibold text-white mb-2">Consulting Cloud...</h3>
                                <p className="text-gray-400">Query: {generatedQuestion}</p>
                            </motion.div>
                        )}

                        {status === 'result' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="w-full text-left"
                            >
                                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">You asked</p>
                                    <p className="text-lg text-white">{transcript}</p>
                                </div>

                                <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">Local LLM Thought</p>
                                    <p className="text-md text-purple-100 italic">"{generatedQuestion}"</p>
                                </div>

                                <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-xs text-blue-300 uppercase tracking-wider mb-2">Gemini Answer</p>
                                    <p className="text-lg text-white leading-relaxed">{answer}</p>
                                </div>

                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                                    >
                                        Ask Another Question
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistant;
