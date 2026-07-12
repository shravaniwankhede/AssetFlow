import React, { useState } from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import toast from 'react-hot-toast';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  ArrowLeftRight, 
  CheckSquare, 
  Search,
  Clock
} from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  const { notifications, markAllNotificationsRead } = useAssetFlow();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    toast.success('All notifications marked as read.');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Alerts': 
        return <AlertTriangle className="icon-alert" size={16} />;
      case 'Approvals': 
        return <ArrowLeftRight className="icon-approval" size={16} />;
      case 'Bookings': 
        return <Calendar className="icon-booking" size={16} />;
      default: 
        return <Bell className="icon-default" size={16} />;
    }
  };

  // Filter logs
  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeFilter === 'All' || n.category === activeFilter;
    const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="notifications-page">
      <div className="notif-header-row">
        <div>
          <h1 className="page-heading">Activity Logs & Notifications</h1>
          <p className="page-subheading">View security events, allocation logs, and diagnostic updates.</p>
        </div>
        <button 
          className="btn btn-secondary btn-mark-read"
          onClick={handleMarkAllRead}
        >
          <CheckSquare size={14} />
          Mark All Read
        </button>
      </div>

      <div className="notif-search-filter-card card">
        {/* Category Tabs */}
        <div className="notif-tabs">
          {['All', 'Alerts', 'Approvals', 'Bookings'].map(tab => (
            <button
              key={tab}
              className={`notif-tab-btn ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="notif-search-bar">
          <Search size={16} className="notif-search-icon" />
          <input 
            type="text" 
            placeholder="Search logs by keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="notif-search-input"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list-container card">
        {filteredNotifications.length > 0 ? (
          <div className="notif-items-list">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notif-list-item ${notif.read ? 'read' : 'unread'}`}
              >
                <div className="notif-icon-col">
                  {getIcon(notif.type)}
                </div>
                
                <div className="notif-content-col">
                  <span className="notif-message-text">{notif.message}</span>
                  <div className="notif-meta-row">
                    <span className="notif-category-tag">{notif.type}</span>
                    <span className="notif-time-badge">
                      <Clock size={11} />
                      {notif.time}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <div className="notif-unread-dot" title="Unread event"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-notif-state">
            <Bell size={36} className="empty-bell-icon" />
            <span>No activity logs match your filters.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
