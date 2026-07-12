import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SuggestedPrompts from './SuggestedPrompts';
import TypingIndicator from './TypingIndicator';
import './ChatWindow.css';

const ChatWindow = () => {
  const { isOpen, setIsOpen, messages, isTyping, sendMessage, clearConversation } = useChat();
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Auto scroll to bottom when new messages arrive or typing starts
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Escape key to close chat window
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={chatWindowRef}
      className="chat-window-panel"
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      aria-modal="true"
      role="dialog"
      aria-label="AssetFlow AI Assistant"
    >
      {/* 1. Header */}
      <ChatHeader />

      {/* 2. Messages List Scroll Area */}
      <div className="chat-messages-scroll-area">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Utility Row (Clear History + Quick Suggested Prompts) */}
      <div className="chat-utility-dock">
        <div className="dock-actions-row">
          <button 
            className="clear-history-btn" 
            onClick={clearConversation}
            title="Clear Chat History"
            aria-label="Clear chat history"
          >
            <Trash2 size={12} />
            <span>Clear conversation</span>
          </button>
        </div>

        {/* Suggested Prompts Section */}
        <SuggestedPrompts onPromptClick={sendMessage} />
      </div>

      {/* 4. Chat Input Section */}
      <ChatInput />
    </motion.div>
  );
};

export default ChatWindow;
