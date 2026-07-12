import React from 'react';
import { Minus, X, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import './ChatHeader.css';

const ChatHeader = () => {
  const { setIsOpen } = useChat();

  return (
    <div className="chat-header">
      <div className="header-branding">
        <div className="copilot-avatar-badge">
          <Sparkles size={16} className="sparkle-icon" />
        </div>
        <div className="header-title-text-group">
          <h2 className="header-title">AssetFlow AI Copilot</h2>
          <span className="header-subtitle">Enterprise Asset Assistant</span>
        </div>
      </div>
      <div className="header-controls">
        <button 
          className="header-control-btn btn-minimize" 
          onClick={() => setIsOpen(false)}
          title="Minimize Chat"
          aria-label="Minimize Chat"
        >
          <Minus size={16} />
        </button>
        <button 
          className="header-control-btn btn-close" 
          onClick={() => setIsOpen(false)}
          title="Close Chat"
          aria-label="Close Chat"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
