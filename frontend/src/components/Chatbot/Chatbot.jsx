import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import FloatingButton from './FloatingButton';
import ChatWindow from './ChatWindow';
import './Chatbot.css';

const Chatbot = () => {
  const { navigationTrigger, setNavigationTrigger, currentUser } = useChat();
  const navigate = useNavigate();

  // Handle programmatic navigation triggers from AI service
  useEffect(() => {
    if (navigationTrigger && navigationTrigger.route) {
      const { route } = navigationTrigger;
      // Navigate to the target page
      navigate(route);
      // Clear the trigger
      setNavigationTrigger(null);
    }
  }, [navigationTrigger, navigate, setNavigationTrigger]);

  // Only render chatbot if a user is authenticated
  if (!currentUser) return null;

  return (
    <div className="assetflow-copilot-container">
      {/* Launcher Button */}
      <FloatingButton />

      {/* Chat Window Panel with exit animations */}
      <AnimatePresence>
        <ChatWindow />
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
