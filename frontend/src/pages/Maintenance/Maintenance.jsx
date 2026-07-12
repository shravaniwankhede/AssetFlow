import React, { useState } from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import Modal from '../../components/layout/Modal';
import toast from 'react-hot-toast';
import { 
  PlusCircle, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Wrench, 
  CheckCircle,
  FileText,
  Clock
} from 'lucide-react';
import './Maintenance.css';

const Maintenance = () => {
  const { 
    maintenanceTickets, 
    assets, 
    updateMaintenanceStatus, 
    reportMaintenance,
    currentUser 
  } = useAssetFlow();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueNotes, setIssueNotes] = useState('');

  // Kanban columns config
  const columns = [
    { id: 'Pending', label: 'Pending Request', color: 'border-pending' },
    { id: 'Approved', label: 'Approved', color: 'border-approved' },
    { id: 'Technician Assigned', label: 'Technician Assigned', color: 'border-assigned' },
    { id: 'In Progress', label: 'In Progress', color: 'border-progress' },
    { id: 'Resolved', label: 'Resolved & Closed', color: 'border-resolved' }
  ];

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) {
      toast.error('Please select an asset');
      return;
    }
    if (!issueTitle) {
      toast.error('Please describe the issue');
      return;
    }

    const res = await reportMaintenance(selectedAssetId, issueTitle, issueNotes);
    if (res && res.success) {
      toast.success('Maintenance ticket created. Asset set to Maintenance.');
      setIsReportModalOpen(false);
      
      // Reset
      setSelectedAssetId('');
      setIssueTitle('');
      setIssueNotes('');
    } else {
      toast.error(res?.message || 'Failed to report maintenance');
    }
  };

  const moveCard = async (ticketId, currentStatus, direction) => {
    const colOrder = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];
    const currentIndex = colOrder.indexOf(currentStatus);
    
    let newIndex = currentIndex;
    if (direction === 'forward' && currentIndex < colOrder.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      const nextStatus = colOrder[newIndex];
      // Prompt for technician name if transitioning to Technician Assigned
      let techName = '';
      if (nextStatus === 'Technician Assigned') {
        techName = prompt('Enter name of technician to assign:') || 'Tech Support Team';
      }
      
      await updateMaintenanceStatus(ticketId, nextStatus, techName);
      toast.success(`Ticket status updated to ${nextStatus}`);
    }
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-header-row">
        <div>
          <h1 className="page-heading">Maintenance Management</h1>
          <p className="page-subheading">Track equipment diagnostics, dispatch repair staff, and verify resolutions.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsReportModalOpen(true)}
        >
          <PlusCircle size={16} />
          Report Issue
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-board">
        {columns.map((col) => {
          const ticketsInCol = maintenanceTickets.filter(t => t.status === col.id);
          
          return (
            <div key={col.id} className={`kanban-column ${col.color}`}>
              <div className="column-header">
                <span className="column-title">{col.label}</span>
                <span className="column-count-badge">{ticketsInCol.length}</span>
              </div>

              <div className="column-cards-container">
                {ticketsInCol.length > 0 ? (
                  ticketsInCol.map((ticket) => (
                    <div key={ticket.id} className={`kanban-card ${col.id === 'Resolved' ? 'resolved-card' : ''}`}>
                      <div className="card-header-row">
                        <span className="ticket-id">{ticket.assetId}</span>
                        {ticket.dateReported && (
                          <span className="ticket-date">
                            <Clock size={10} />
                            {ticket.dateReported}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="ticket-title-text">{ticket.title}</h4>
                      {ticket.notes && <p className="ticket-notes-desc">{ticket.notes}</p>}
                      
                      {ticket.technician && (
                        <div className="ticket-tech-badge">
                          <User size={12} />
                          <span>{ticket.technician}</span>
                        </div>
                      )}

                      {/* Transition controls */}
                      <div className="card-controls">
                        {col.id !== 'Pending' ? (
                          <button 
                            className="btn-move btn-back"
                            onClick={() => moveCard(ticket.id, col.id, 'backward')}
                            aria-label="Move backward"
                          >
                            <ChevronLeft size={14} />
                          </button>
                        ) : <div />}

                        <div className="card-icon-status">
                          {col.id === 'Resolved' ? (
                            <CheckCircle size={14} className="resolved-icon" />
                          ) : (
                            <Wrench size={14} className="maint-icon" />
                          )}
                        </div>

                        {col.id !== 'Resolved' ? (
                          <button 
                            className="btn-move btn-forward"
                            onClick={() => moveCard(ticket.id, col.id, 'forward')}
                            aria-label="Move forward"
                          >
                            <ChevronRight size={14} />
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-column-placeholder">
                    <span>No tickets</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Maintenance Form Modal */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Report Maintenance Issue">
        <form onSubmit={handleReportSubmit} className="maintenance-modal-form">
          <div className="form-group">
            <label className="form-label">Select Asset</label>
            <select 
              className="form-input"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              required
            >
              <option value="">Select Asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.id} - {a.name} ({a.status})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Problem Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Screen flickering, loose wiring" 
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Details / Troubleshooting notes</label>
            <textarea 
              className="form-input text-area-input" 
              placeholder="Describe the issue in detail to assist diagnostic team..." 
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
            />
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
