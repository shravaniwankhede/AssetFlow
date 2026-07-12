import React from 'react';
import './ChatWindow.css'; // sharing css or we can style inline

const SuggestedPrompts = ({ onPromptClick }) => {
  const prompts = [
    'Find available laptops',
    'Show my allocated assets',
    'Today\'s Dashboard Summary',
    'Pending Maintenance',
    'Audit Summary',
    'Who has Asset AF-0012?',
    'Open Reports',
    'Book Conference Room'
  ];

  return (
    <div className="suggested-prompts-container">
      <div className="suggested-prompts-scroll">
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            className="suggested-prompt-chip"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
