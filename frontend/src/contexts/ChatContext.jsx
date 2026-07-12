import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAssetFlow } from './AssetFlowContext';
import { sendMessage as sendChatMessage, startConversation } from '../services/chatService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const erpContext = useAssetFlow();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [navigationTrigger, setNavigationTrigger] = useState(null);

  // Initialize welcome message when the session starts or user logs in
  useEffect(() => {
    if (erpContext.currentUser) {
      setMessages(startConversation());
    } else {
      setMessages([]);
      setIsOpen(false);
    }
  }, [erpContext.currentUser]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const clearConversation = () => {
    setMessages(startConversation());
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Call service layer
      const response = await sendChatMessage(text, messages, erpContext);
      
      // 3. Add AI message
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
        actionData: response.data
      };

      setMessages(prev => [...prev, aiMsg]);

      // 4. Handle navigation command action immediately
      if (response.action === 'NAVIGATE' && response.data?.route) {
        setNavigationTrigger({ route: response.data.route, timestamp: Date.now() });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errMsg = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ I encountered an error communicating with the ERP system. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      isOpen,
      setIsOpen,
      toggleChat,
      messages,
      isTyping,
      sendMessage,
      clearConversation,
      navigationTrigger,
      setNavigationTrigger,
      currentUser: erpContext.currentUser
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
