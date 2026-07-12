import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import './FloatingButton.css';

const FloatingButton = () => {
  const { toggleChat, isOpen } = useChat();
  const [isExpanded, setIsExpanded] = useState(true);

  // Automatically collapse the button after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isOpen) return null; // Hide button when chat window is open

  return (
    <motion.button
      className="floating-ai-launcher"
      onClick={toggleChat}
      initial={{ scale: 0, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      aria-label="Ask AssetFlow AI Copilot"
    >
      <div className="launcher-content-wrapper">
        <motion.div 
          className="launcher-icon-box"
          animate={{ rotate: isExpanded ? [0, -10, 10, -10, 0] : 0 }}
          transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.5 }}
        >
          <Sparkles size={20} className="sparkle-glow-icon" />
        </motion.div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              className="launcher-text-label"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Ask AssetFlow AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

export default FloatingButton;
