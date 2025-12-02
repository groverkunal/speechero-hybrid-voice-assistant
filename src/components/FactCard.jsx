import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const FactCard = ({ query, answer, onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="glass-panel rounded-lg p-3 mb-2 relative border-l-2 border-yellow-400"
        >
            <button
                onClick={onDismiss}
                className="absolute top-1 right-1 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
                <X size={14} className="text-gray-400" />
            </button>

            <div className="pr-6">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={12} className="text-yellow-400 flex-shrink-0" />
                    <p className="text-xs text-gray-400 italic">"{query}"</p>
                </div>
                <p className="text-sm text-white leading-snug">{answer}</p>
            </div>
        </motion.div>
    );
};

export default FactCard;
