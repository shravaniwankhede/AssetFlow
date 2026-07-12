import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import KPICards from '../../components/layout/KPICards';
import { 
  Laptop, 
  UserCheck, 
  AlertTriangle, 
  CalendarDays, 
  ArrowLeftRight, 
  Clock, 
  PlusCircle, 
  BookOpen, 
  HelpCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { assets, bookings, transfers, notifications } = useAssetFlow();
  const navigate = useNavigate();

  // Compute KPI values dynamically
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter(a => a.status === 'Maintenance').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Pending').length;
  const upcomingReturnsCount = 12; // Standard mock value matching wireframe

  const kpis = [
    { title: 'Available Assets', value: availableCount, icon: Laptop, variant: 'success', description: 'Ready to allocate' },
    { title: 'Allocated Assets', value: allocatedCount, icon: UserCheck, variant: 'primary', description: 'Assigned to employees' },
    { title: 'Under Maintenance', value: maintenanceCount, icon: AlertTriangle, variant: 'warning', description: 'In repair pipeline' },
    { title: 'Active Bookings', value: activeBookingsCount, icon: CalendarDays, variant: 'primary', description: 'Resources reserved' },
    { title: 'Pending Transfers', value: pendingTransfersCount, icon: ArrowLeftRight, variant: 'warning', description: 'Awaiting approvals' },
    { title: 'Upcoming Returns', value: upcomingReturnsCount, icon: Clock, variant: 'danger', description: 'Due within 7 days' },
  ];

  // Recent activity logs
  const recentActivities = [
    { id: 1, text: 'Laptop AF-0114 - allocated to Priya Shah - Engineering dept', time: '10m ago' },
    { id: 2, text: 'Room 301 - booking confirmed - 2:00 to 3:00 PM', time: '1h ago' },
    { id: 3, text: 'Projector AF-0082 - maintenance resolved', time: '4h ago' },
    { id: 4, text: 'Tesla Model 3 AF-0099 - transfer request raised by Sam Iqbal', time: '1d ago' },
  ];

  return (
    <div className="dashboard-page">
      {/* Title section */}
      <div className="dashboard-title-row">
        <div>
          <h1 className="page-heading">Today's Overview</h1>
          <p className="page-subheading">Monitor real-time resource utilization and pending actions.</p>
        </div>
      </div>

      {/* KPI Section */}
      <KPICards cards={kpis} />

      {/* Overdue Alert banner */}
      <div className="overdue-alert-banner">
        <div className="alert-content">
          <AlertTriangle size={18} className="alert-icon" />
          <span><strong>3 assets overdue for return</strong> - Flagged for follow-up and notification alerts sent.</span>
        </div>
        <button className="alert-action-btn" onClick={() => navigate('/notifications')}>
          View Details
        </button>
      </div>

      {/* Main Grid: Left column (Recent Activity, Quick Actions), Right column (Charts, Notifications Preview) */}
      <div className="dashboard-grid">
        <div className="dashboard-left-col">
          {/* Quick Actions Card */}
          <div className="card dashboard-actions-card">
            <h3 className="card-title">Quick Actions</h3>
            <div className="quick-actions-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/assets')}>
                <PlusCircle size={16} />
                Register Asset
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/resources')}>
                <BookOpen size={16} />
                Book Resource
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/allocation')}>
                <ArrowLeftRight size={16} />
                Raise Request
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="card recent-activity-card">
            <h3 className="card-title">Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map(act => (
                <div key={act.id} className="activity-item">
                  <div className="activity-bullet"></div>
                  <div className="activity-content">
                    <span className="activity-text">{act.text}</span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-right-col">
          {/* Charts Row */}
          <div className="dashboard-charts-grid">
            {/* Chart 1: Bar Chart */}
            <div className="card chart-card">
              <h4 className="chart-title">Utilization by Department</h4>
              <div className="chart-wrapper bar-chart-wrapper">
                {/* SVG Bar Chart */}
                <svg viewBox="0 0 300 150" className="svg-chart">
                  {/* Grid Lines */}
                  <line x1="30" y1="120" x2="280" y2="120" stroke="#E2E8F0" />
                  <line x1="30" y1="85" x2="280" y2="85" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="30" y1="50" x2="280" y2="50" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="30" y1="15" x2="280" y2="15" stroke="#E2E8F0" strokeDasharray="3 3" />
                  
                  {/* Bars (Engineering, HR, Finance, Operations) */}
                  {/* Eng: 85% */}
                  <rect x="55" y="30" width="24" height="90" fill="#2563EB" rx="3" />
                  {/* HR: 45% */}
                  <rect x="115" y="70" width="24" height="50" fill="#3B82F6" rx="3" />
                  {/* Finance: 60% */}
                  <rect x="175" y="55" width="24" height="65" fill="#60A5FA" rx="3" />
                  {/* Operations: 75% */}
                  <rect x="235" y="42" width="24" height="78" fill="#93C5FD" rx="3" />

                  {/* Axis Labels */}
                  <text x="67" y="135" fontSize="9" textAnchor="middle" fill="#64748B">ENG</text>
                  <text x="127" y="135" fontSize="9" textAnchor="middle" fill="#64748B">HR</text>
                  <text x="187" y="135" fontSize="9" textAnchor="middle" fill="#64748B">FIN</text>
                  <text x="247" y="135" fontSize="9" textAnchor="middle" fill="#64748B">OPS</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Line Chart */}
            <div className="card chart-card">
              <h4 className="chart-title">Maintenance Frequency</h4>
              <div className="chart-wrapper line-chart-wrapper">
                {/* SVG Line Chart */}
                <svg viewBox="0 0 300 150" className="svg-chart">
                  <path 
                    d="M 30,120 L 70,100 L 110,110 L 150,60 L 190,75 L 230,30 L 270,45" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="3" 
                  />
                  <circle cx="70" cy="100" r="4" fill="#3B82F6" />
                  <circle cx="150" cy="60" r="4" fill="#3B82F6" />
                  <circle cx="230" cy="30" r="4" fill="#3B82F6" />
                  {/* Labels */}
                  <text x="30" y="135" fontSize="9" textAnchor="middle" fill="#64748B">Jan</text>
                  <text x="110" y="135" fontSize="9" textAnchor="middle" fill="#64748B">Mar</text>
                  <text x="190" y="135" fontSize="9" textAnchor="middle" fill="#64748B">May</text>
                  <text x="270" y="135" fontSize="9" textAnchor="middle" fill="#64748B">Jul</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Notifications Preview Card */}
          <div className="card notifications-preview-card">
            <div className="notifications-header">
              <h3 className="card-title">Notifications Preview</h3>
              <button className="text-btn" onClick={() => navigate('/notifications')}>View All</button>
            </div>
            <div className="notifications-preview-list">
              {notifications.slice(0, 3).map(notif => (
                <div key={notif.id} className={`notif-preview-item ${notif.read ? 'read' : 'unread'}`}>
                  <div className="notif-preview-indicator"></div>
                  <div className="notif-preview-content">
                    <span className="notif-preview-msg">{notif.message}</span>
                    <span className="notif-preview-time">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
