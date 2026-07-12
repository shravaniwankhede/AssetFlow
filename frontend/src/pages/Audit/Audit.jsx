import React, { useState } from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import toast from 'react-hot-toast';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import './Audit.css';

const Audit = () => {
  const { audits, updateAuditItemVerification, closeAudit, currentUser } = useAssetFlow();
  
  // Choose the ongoing audit
  const activeAudit = audits.find(a => a.status === 'Ongoing') || audits[0];

  const handleVerify = (assetId, status) => {
    updateAuditItemVerification(activeAudit.id, assetId, status);
    toast.success(`Asset ${assetId} flagged as ${status}`);
  };

  const handleCloseAudit = () => {
    if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Asset Manager') {
      toast.error('Permission denied: Only Admins or Asset Managers can close audits');
      return;
    }
    
    closeAudit(activeAudit.id);
    toast.success('Audit successfully closed. System inventory updated.');
  };

  // Compute stats
  const verifiedCount = activeAudit.items.filter(item => item.verification === 'Verified').length;
  const missingCount = activeAudit.items.filter(item => item.verification === 'Missing').length;
  const damagedCount = activeAudit.items.filter(item => item.verification === 'Damaged').length;
  const pendingCount = activeAudit.items.filter(item => !item.verification).length;

  return (
    <div className="audit-page">
      <div className="audit-header-row">
        <div>
          <h1 className="page-heading">Asset Audit Cycles</h1>
          <p className="page-subheading">Perform department audits, flag missing items, and resolve discrepancies.</p>
        </div>
      </div>

      {activeAudit ? (
        <div className="audit-content-layout">
          {/* Audit Meta Summary Card */}
          <div className="card audit-summary-card">
            <div className="summary-card-header">
              <ClipboardCheck className="audit-icon" size={24} />
              <div>
                <h2 className="audit-cycle-title">{activeAudit.title}</h2>
                <p className="audit-cycle-meta">
                  Status: <strong className={activeAudit.status.toLowerCase()}>{activeAudit.status}</strong> | Date: {activeAudit.dateCreated}
                </p>
              </div>
            </div>

            <div className="auditors-row">
              <span>Auditors Assigned: <strong>{activeAudit.auditors.join(', ')}</strong></span>
            </div>

            {/* Micro progress stats grid */}
            <div className="audit-stats-grid">
              <div className="stat-box verified">
                <span className="stat-val">{verifiedCount}</span>
                <span className="stat-lbl">Verified</span>
              </div>
              <div className="stat-box missing">
                <span className="stat-val">{missingCount}</span>
                <span className="stat-lbl">Missing</span>
              </div>
              <div className="stat-box damaged">
                <span className="stat-val">{damagedCount}</span>
                <span className="stat-lbl">Damaged</span>
              </div>
              <div className="stat-box pending">
                <span className="stat-val">{pendingCount}</span>
                <span className="stat-lbl">Unverified</span>
              </div>
            </div>
          </div>

          {/* Audit Verification Table */}
          <div className="card audit-checklist-card">
            <h3 className="card-title">Inventory Verification Checklist</h3>
            
            <div className="table-responsive-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Asset Name</th>
                    <th>Reported Location</th>
                    <th>Verification State</th>
                    {activeAudit.status === 'Ongoing' && <th>Perform Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {activeAudit.items.map((item) => (
                    <tr key={item.assetId} className="audit-table-row">
                      <td className="item-id">{item.assetId}</td>
                      <td className="item-name">{item.name}</td>
                      <td className="item-loc">{item.location}</td>
                      <td>
                        {item.verification ? (
                          <span className={`verif-badge ${item.verification.toLowerCase()}`}>
                            {item.verification === 'Verified' && <CheckCircle2 size={12} />}
                            {item.verification === 'Missing' && <XCircle size={12} />}
                            {item.verification === 'Damaged' && <AlertTriangle size={12} />}
                            {item.verification}
                          </span>
                        ) : (
                          <span className="verif-badge pending">Awaiting Check</span>
                        )}
                      </td>
                      {activeAudit.status === 'Ongoing' && (
                        <td>
                          <div className="audit-action-buttons">
                            <button 
                              className="btn-verif verify-success"
                              onClick={() => handleVerify(item.assetId, 'Verified')}
                              title="Verify location and status"
                            >
                              Verify
                            </button>
                            <button 
                              className="btn-verif verify-danger"
                              onClick={() => handleVerify(item.assetId, 'Missing')}
                              title="Flag as Missing"
                            >
                              Missing
                            </button>
                            <button 
                              className="btn-verif verify-warning"
                              onClick={() => handleVerify(item.assetId, 'Damaged')}
                              title="Flag as Damaged"
                            >
                              Damaged
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Warning discrepancy banner and close audit actions */}
            {activeAudit.status === 'Ongoing' && (
              <div className="audit-footer-actions">
                {(missingCount > 0 || damagedCount > 0) && (
                  <div className="discrepancy-warning-banner">
                    <AlertTriangle size={18} />
                    <span>
                      <strong>{missingCount + damagedCount} discrepancies flagged</strong> - Discrepancy report generated automatically.
                    </span>
                  </div>
                )}
                
                <div className="close-audit-row">
                  <p className="notice-text">
                    Closing the audit cycle will automatically update asset states (Missing to <strong>Lost</strong>, Damaged to <strong>Maintenance</strong>) and lock modifications.
                  </p>
                  <button 
                    className="btn btn-danger btn-close-audit"
                    onClick={handleCloseAudit}
                  >
                    <ShieldCheck size={16} />
                    Close Audit Cycle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-audit-state">
          <span>No active audit cycles found.</span>
        </div>
      )}
    </div>
  );
};

export default Audit;
