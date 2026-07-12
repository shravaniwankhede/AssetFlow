import React from 'react';
import './Loader.css';

const Loader = ({ type = 'spinner' }) => {
  if (type === 'skeleton-table') {
    return (
      <div className="skeleton-table-wrapper">
        <div className="skeleton-row header-skeleton"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton-row"></div>
        ))}
      </div>
    );
  }

  if (type === 'skeleton-cards') {
    return (
      <div className="skeleton-cards-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line title-skeleton"></div>
            <div className="skeleton-line value-skeleton"></div>
            <div className="skeleton-line text-skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
