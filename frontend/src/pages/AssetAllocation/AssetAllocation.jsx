import React, { useState, useEffect } from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeftRight, UserCheck, CheckCircle2, History } from 'lucide-react';
import './AssetAllocation.css';

const AssetAllocation = () => {
  const { 
    assets, 
    usersList, 
    allocateAsset, 
    createTransferRequest,
    transfers,
    approveTransferRequest,
    currentUser
  } = useAssetFlow();

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // Direct Allocation states
  const [assigneeName, setAssigneeName] = useState('');
  const [allocationNotes, setAllocationNotes] = useState('');

  // Transfer Request states
  const [transferToEmployee, setTransferToEmployee] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Filter out active options
  const allocatedAssets = assets.filter(a => a.status === 'Allocated');
  
  useEffect(() => {
    if (selectedAssetId) {
      const asset = assets.find(a => a.id === selectedAssetId);
      setSelectedAsset(asset || null);
    } else {
      setSelectedAsset(null);
    }
  }, [selectedAssetId, assets]);

  const handleDirectAllocate = async (e) => {
    e.preventDefault();
    if (!assigneeName) {
      toast.error('Please select an employee to allocate');
      return;
    }
    const res = await allocateAsset(selectedAsset.id, assigneeName, allocationNotes);
    if (res.success) {
      toast.success(`Asset ${selectedAsset.id} successfully allocated to ${assigneeName}!`);
      // Reset
      setAssigneeName('');
      setAllocationNotes('');
    } else {
      toast.error(res.message);
    }
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    if (!transferToEmployee) {
      toast.error('Please select an employee to transfer to');
      return;
    }
    if (!transferReason) {
      toast.error('Please provide a reason for the transfer');
      return;
    }

    const res = await createTransferRequest(selectedAsset.id, transferToEmployee, transferReason);
    if (res.success) {
      toast.success('Transfer request submitted successfully!');
      // Reset
      setTransferToEmployee('');
      setTransferReason('');
    } else {
      toast.error(res.message);
    }
  };

  const handleApproveTransfer = async (transferId) => {
    const res = await approveTransferRequest(transferId);
    if (res.success) {
      toast.success('Transfer request approved and asset reallocated!');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="asset-allocation-page">
      <div className="allocation-header-row">
        <div>
          <h1 className="page-heading">Asset Allocation & Transfer</h1>
          <p className="page-subheading">Assign equipment or submit peer-to-peer transfer approvals.</p>
        </div>
      </div>

      <div className="allocation-grid">
        {/* Left Side: Select Asset and Forms */}
        <div className="allocation-left-col">
          <div className="card form-card">
            <h3 className="card-title">Select Asset to Allocate or Transfer</h3>
            
            <div className="form-group">
              <label className="form-label">Asset</label>
              <select
                className="form-input"
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
              >
                <option value="">-- Choose Asset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.name} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedAsset && (
              <div className="asset-quick-info">
                <span className="info-badge">Current Status: {selectedAsset.status}</span>
                {selectedAsset.assignedTo && (
                  <span className="info-assigned">Assigned to: <strong>{selectedAsset.assignedTo}</strong> ({selectedAsset.department})</span>
                )}
              </div>
            )}

            {/* BLOCK ACTIVE WARNING (Double-Allocation prevention) */}
            {selectedAsset && selectedAsset.status === 'Allocated' && (
              <div className="double-allocation-warning">
                <div className="warning-header">
                  <AlertCircle size={18} />
                  <span>Already allocated to {selectedAsset.assignedTo} ({selectedAsset.department})</span>
                </div>
                <p className="warning-body">
                  Direct reallocation is blocked. You must submit a Transfer request below.
                </p>
              </div>
            )}

            {/* Render appropriate form */}
            {selectedAsset && selectedAsset.status === 'Allocated' ? (
              // Transfer Form
              <form onSubmit={handleTransferRequest} className="allocation-inner-form">
                <h4 className="form-sub-title">Submit Transfer Request</h4>
                
                <div className="form-group">
                  <label className="form-label">From</label>
                  <input 
                    type="text" 
                    className="form-input disabled-input" 
                    value={selectedAsset.assignedTo} 
                    readOnly 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">To (Select Employee)</label>
                  <select 
                    className="form-input"
                    value={transferToEmployee}
                    onChange={(e) => setTransferToEmployee(e.target.value)}
                    required
                  >
                    <option value="">Select Employee...</option>
                    {usersList
                      .filter(u => u.name !== selectedAsset.assignedTo && u.status === 'Active')
                      .map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.department})</option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea 
                    className="form-input text-area-input" 
                    placeholder="Provide justification for peer-to-peer transfer..." 
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary submit-request-btn">
                  <ArrowLeftRight size={16} />
                  Submit Request
                </button>
              </form>
            ) : selectedAsset && selectedAsset.status === 'Available' ? (
              // Direct Allocation Form
              <form onSubmit={handleDirectAllocate} className="allocation-inner-form">
                <h4 className="form-sub-title">Direct Asset Allocation</h4>

                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select 
                    className="form-input"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    required
                  >
                    <option value="">Select Employee...</option>
                    {usersList
                      .filter(u => u.status === 'Active')
                      .map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.department})</option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition / Allocation Notes</label>
                  <textarea 
                    className="form-input text-area-input" 
                    placeholder="Describe condition details, desk location etc..." 
                    value={allocationNotes}
                    onChange={(e) => setAllocationNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-success submit-request-btn">
                  <UserCheck size={16} />
                  Allocate Asset
                </button>
              </form>
            ) : selectedAsset ? (
              <div className="status-notice-card">
                <p>This asset is currently <strong>{selectedAsset.status}</strong>. Direct allocations and transfers can only be processed on Available or Allocated inventory.</p>
              </div>
            ) : (
              <div className="empty-select-notice">
                <p>Choose an asset from the dropdown list to initiate assignment or transfer operations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Transfer Tickets and Asset History */}
        <div className="allocation-right-col">
          {/* Transfer Tickets */}
          <div className="card pending-transfers-card">
            <h3 className="card-title">Pending Transfer Approvals</h3>
            <div className="transfers-list">
              {transfers.filter(t => t.status === 'Pending').length > 0 ? (
                transfers.filter(t => t.status === 'Pending').map(t => (
                  <div key={t.id} className="transfer-ticket-item">
                    <div className="ticket-header">
                      <span className="ticket-asset">{t.assetId} - {t.assetName}</span>
                      <span className="ticket-status-badge">Awaiting Admin</span>
                    </div>
                    <div className="ticket-body">
                      <p><strong>From:</strong> {t.fromEmployee} &rarr; <strong>To:</strong> {t.toEmployee}</p>
                      <p className="ticket-reason">&ldquo;{t.reason}&rdquo;</p>
                    </div>
                    <div className="ticket-actions">
                      <button 
                        className="btn btn-success ticket-btn" 
                        disabled={currentUser?.role !== 'Admin'}
                        onClick={() => handleApproveTransfer(t.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-transfers">
                  <CheckCircle2 size={32} className="check-icon" />
                  <span>No pending transfer approvals.</span>
                </div>
              )}
            </div>
          </div>

          {/* Allocation History Log */}
          {selectedAsset && (
            <div className="card allocation-history-card">
              <div className="history-header">
                <History size={16} />
                <h3 className="card-title">Allocation History</h3>
              </div>
              <div className="allocation-history-list">
                {selectedAsset.history.map((log, idx) => (
                  <div key={idx} className="history-log-row">
                    <div className="history-date-col">
                      <span className="history-date">{log.date}</span>
                    </div>
                    <div className="history-content-col">
                      <span className="history-action">{log.action}</span>
                      <p className="history-notes">{log.notes}</p>
                      <span className="history-actor">by {log.performedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
