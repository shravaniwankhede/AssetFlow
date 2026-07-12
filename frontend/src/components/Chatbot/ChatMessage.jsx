import React from 'react';
import { User, Sparkles, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChat } from '../../hooks/useChat';
import './ChatMessage.css';

// Custom Markdown Helper functions
const parseInlineMarkdown = (text) => {
  if (!text) return '';
  const parts = [];
  const tokenRegex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  
  const matches = [...text.matchAll(tokenRegex)];
  if (matches.length === 0) {
    return text;
  }

  matches.forEach((match, idx) => {
    const textPart = text.substring(lastIndex, match.index);
    if (textPart) parts.push(textPart);

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={idx}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={idx} className="inline-code">{token.slice(1, -1)}</code>);
    }
    lastIndex = match.index + token.length;
  });

  const endPart = text.substring(lastIndex);
  if (endPart) parts.push(endPart);

  return parts;
};

const renderMarkdown = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  const elements = [];
  let tableHeader = null;
  let tableRows = [];
  let isInTable = false;
  let isInCode = false;
  let codeContent = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code Block Check
    if (line.startsWith('```')) {
      if (isInCode) {
        elements.push(
          <pre key={`code-${i}`} className="message-code-block">
            <code className={codeLang}>{codeContent.join('\n')}</code>
          </pre>
        );
        codeContent = [];
        isInCode = false;
      } else {
        codeLang = line.replace('```', '').trim() || 'javascript';
        isInCode = true;
      }
      continue;
    }

    if (isInCode) {
      codeContent.push(line);
      continue;
    }

    // Table Check
    if (line.startsWith('|')) {
      isInTable = true;
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (line.includes('---')) {
        continue;
      }

      if (!tableHeader) {
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      if (isInTable && tableHeader) {
        elements.push(
          <div key={`table-${i}`} className="message-table-wrapper">
            <table className="message-table">
              <thead>
                <tr>
                  {tableHeader.map((h, idx) => <th key={idx}>{parseInlineMarkdown(h)}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => <td key={cIdx}>{parseInlineMarkdown(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeader = null;
        tableRows = [];
        isInTable = false;
      }
    }

    // List Check
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      elements.push(
        <ul key={`ul-${i}`} className="message-ul">
          <li>{parseInlineMarkdown(line.trim().substring(2))}</li>
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <ol key={`ol-${i}`} className="message-ol" start={match[1]}>
            <li>{parseInlineMarkdown(match[2])}</li>
          </ol>
        );
        continue;
      }
    }

    // Heading Check
    if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} className="message-h3">{parseInlineMarkdown(line.substring(4))}</h3>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${i}`} className="message-h2">{parseInlineMarkdown(line.substring(3))}</h2>);
      continue;
    }

    // Regular line
    if (line.trim() !== '') {
      elements.push(<p key={`p-${i}`} className="message-paragraph">{parseInlineMarkdown(line)}</p>);
    }
  }

  // Handle trailing table
  if (isInTable && tableHeader) {
    elements.push(
      <div key={`table-trail`} className="message-table-wrapper">
        <table className="message-table">
          <thead>
            <tr>
              {tableHeader.map((h, idx) => <th key={idx}>{parseInlineMarkdown(h)}</th>)}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => <td key={cIdx}>{parseInlineMarkdown(cell)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return elements;
};

const ChatMessage = ({ message }) => {
  const { sendMessage, currentUser } = useChat();
  const isAI = message.sender === 'ai';

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.text);
    toast.success('Copied to clipboard!');
  };

  const handleActionClick = (actionType, actionData) => {
    if (actionType === 'navigate' && actionData?.route) {
      sendMessage(`Go to ${actionData.route.slice(1)}`);
    } else if (actionType === 'allocate') {
      sendMessage('Open allocations');
    } else if (actionType === 'maintenance') {
      sendMessage('Open maintenance');
    }
  };

  return (
    <div className={`message-row ${isAI ? 'ai-message' : 'user-message'}`}>
      <div className={`message-avatar ${isAI ? 'ai-avatar' : 'user-avatar'}`}>
        {isAI ? <Sparkles size={14} /> : <span>{userInitials}</span>}
      </div>
      
      <div className="message-content-box">
        <div className={`message-bubble ${isAI ? 'ai-bubble' : 'user-bubble'}`}>
          {renderMarkdown(message.text)}
          
          {/* Action buttons inside ERP Cards */}
          {message.action && (
            <div className="message-action-card">
              <span className="action-card-label">Recommended action:</span>
              <div className="action-card-buttons">
                {message.action === 'SUGGEST_ACTION' && message.actionData?.type === 'allocate' && (
                  <button 
                    className="action-btn"
                    onClick={() => handleActionClick('allocate')}
                  >
                    🔑 Allocate Asset
                  </button>
                )}
                {message.action === 'SUGGEST_ACTION' && message.actionData?.type === 'maintenance' && (
                  <button 
                    className="action-btn"
                    onClick={() => handleActionClick('maintenance')}
                  >
                    🔧 View Maintenance Board
                  </button>
                )}
                {message.action === 'SUGGEST_ACTION' && message.actionData?.type === 'navigate_booking' && (
                  <button 
                    className="action-btn"
                    onClick={() => handleActionClick('navigate', message.actionData)}
                  >
                    📅 Book Timeline
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="message-meta-row">
          <span className="message-timestamp">{message.timestamp}</span>
          {isAI && (
            <div className="message-reactions">
              <button className="reaction-btn" onClick={() => toast.success('Feedback recorded!')} title="Like">
                <ThumbsUp size={12} />
              </button>
              <button className="reaction-btn" onClick={() => toast.success('Feedback recorded!')} title="Dislike">
                <ThumbsDown size={12} />
              </button>
              <button className="reaction-btn" onClick={handleCopyText} title="Copy response">
                <Copy size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
