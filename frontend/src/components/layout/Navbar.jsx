import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import { Bell, Menu, User } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import './Navbar.css';

const Navbar = ({ toggleMobileSidebar }) => {
  const { currentUser, notifications } = useAssetFlow();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobileSidebar}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Breadcrumb />
      </div>

      <div className="navbar-right">
        <button 
          className="navbar-action-btn notification-bell"
          onClick={() => navigate('/notifications')}
          aria-label="View notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        <div className="navbar-profile">
          <div className="profile-icon">
            <User size={16} />
          </div>
          <div className="profile-info">
            <span className="profile-name">{currentUser?.name || 'Employee'}</span>
            <span className="profile-role">{currentUser?.role || 'Guest'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
