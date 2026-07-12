import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeMap = {
    dashboard: 'Dashboard',
    organization: 'Organization Setup',
    assets: 'Assets',
    allocation: 'Allocation & Transfer',
    resources: 'Resource Booking',
    maintenance: 'Maintenance',
    audit: 'Audit',
    reports: 'Reports',
    notifications: 'Notifications',
  };

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard" className="breadcrumb-link breadcrumb-home">
        <Home size={14} />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeMap[value.toLowerCase()] || value;

        return (
          <span key={to} className="breadcrumb-item">
            <ChevronRight className="breadcrumb-separator" size={14} />
            {isLast ? (
              <span className="breadcrumb-current">{displayName}</span>
            ) : (
              <Link to={to} className="breadcrumb-link">
                {displayName}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
