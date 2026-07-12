import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import { 
  LayoutDashboard, 
  Building2, 
  Laptop, 
  ArrowLeftRight, 
  CalendarDays, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isMobileOpen, toggleMobileSidebar, isCollapsed, setIsCollapsed }) => {
  const { currentUser, logout } = useAssetFlow();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role permissions for sidebar links
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/organization', label: 'Organization Setup', icon: Building2, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/assets', label: 'Assets', icon: Laptop, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/allocation', label: 'Allocation & Transfer', icon: ArrowLeftRight, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/resources', label: 'Resource Booking', icon: CalendarDays, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/audit', label: 'Audit', icon: ClipboardCheck, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={toggleMobileSidebar}></div>
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">AF</div>
            {!isCollapsed && <span className="logo-text">AssetFlow</span>}
          </div>
          <button 
            className="collapse-btn desktop-only" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">{currentUser?.name}</span>
              <span className="user-role">{currentUser?.role}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    toggleMobileSidebar();
                  }
                }}
              >
                <Icon className="nav-icon" size={20} />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn nav-item" onClick={handleLogout}>
            <LogOut className="nav-icon" size={20} />
            {!isCollapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
