import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChat } from '../../hooks/useChat';
import './ChatInput.css';

const ChatInput = () => {
  const { sendMessage, isTyping } = useChat();
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize input textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    sendMessage(inputText);
    setInputText('');
    
    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter -> Let standard textarea newline behavior occur
        return;
      }
      // Enter -> Prevent default newline and send message
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicrophoneClick = () => {
    toast.success('Voice dictation is disabled in demo mode.');
  };

  const handleAttachClick = () => {
    toast.success('File attachments are disabled in demo mode.');
  };

  return (
    <div className="chat-input-container">
      <div className="input-action-bar-left">
        <button 
          className="input-action-btn" 
          onClick={handleAttachClick}
          title="Attach file (disabled)"
          aria-label="Attach file"
        >
          <Paperclip size={18} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={1}
        className="chat-textarea-field"
        placeholder="Ask about assets, maintenance, bookings..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Chat input message"
      />

      <div className="input-action-bar-right">
        <button 
          className="input-action-btn" 
          onClick={handleMicrophoneClick}
          title="Voice search (disabled)"
          aria-label="Voice search"
        >
          <Mic size={18} />
        </button>
        <button 
          className={`input-send-btn ${inputText.trim() && !isTyping ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!inputText.trim() || isTyping}
          title="Send message"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
