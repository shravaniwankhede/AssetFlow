import React from 'react';
import { Sparkles } from 'lucide-react';
import './ChatMessage.css'; // sharing chat message styling for the layout

const TypingIndicator = () => {
  return (
    <div className="message-row ai-message typing-indicator-row">
      <div className="message-avatar ai-avatar">
        <Sparkles size={14} />
      </div>
      <div className="message-bubble ai-bubble typing-bubble">
        <div className="typing-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
