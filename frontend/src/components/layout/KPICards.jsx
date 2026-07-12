import React from 'react';
import './KPICards.css';

const KPICards = ({ cards = [] }) => {
  return (
    <div className="kpi-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`kpi-card ${card.variant || ''}`}>
            <div className="kpi-card-header">
              <span className="kpi-card-title">{card.title}</span>
              {Icon && (
                <div className={`kpi-icon-container ${card.variant || ''}`}>
                  <Icon size={18} />
                </div>
              )}
            </div>
            <div className="kpi-card-content">
              <span className="kpi-card-value">{card.value}</span>
              {card.description && (
                <span className="kpi-card-desc">{card.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
