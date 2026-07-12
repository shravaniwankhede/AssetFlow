import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ 
  placeholder = 'Search...', 
  value = '', 
  onChange, 
  filters = [], 
  onFilterChange, 
  selectedFilters = {}, 
  actionButton 
}) => {
  return (
    <div className="search-bar-container">
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            className="search-input" 
            placeholder={placeholder} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
          />
        </div>
        {actionButton && <div className="search-action-wrapper">{actionButton}</div>}
      </div>

      {filters.length > 0 && (
        <div className="search-filters-row">
          {filters.map((filter) => (
            <div key={filter.name} className="filter-select-group">
              <label className="filter-label">{filter.label}:</label>
              <select 
                className="filter-select"
                value={selectedFilters[filter.name] || ''}
                onChange={(e) => onFilterChange(filter.name, e.target.value)}
              >
                <option value="">All {filter.label}s</option>
                {filter.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
