<<<<<<< HEAD:frontend/src/pages/AssetRegistration.jsx
import React, { useState } from 'react';
import { useAssetFlow } from '../contexts/AssetFlowContext';
import DataTable from '../components/layout/DataTable';
import SearchBar from '../components/layout/SearchBar';
import Modal from '../components/layout/Modal';
import StatusBadge from '../components/layout/StatusBadge';
import toast from 'react-hot-toast';
import { PlusCircle, QrCode, FileText, Calendar, User, Eye } from 'lucide-react';
import './AssetRegistration.css';

const AssetRegistration = () => {
  const { assets, categories, departments, registerAsset, currentUser } = useAssetFlow();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    status: '',
    department: ''
  });

  // Modal control
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Laptops');
  const [newLocation, setNewLocation] = useState('Warehouse');
  const [newStatus, setNewStatus] = useState('Available');
  const [newDept, setNewDept] = useState('');
  const [newAssigned, setNewAssigned] = useState('');

  const handleFilterChange = (name, value) => {
    setSelectedFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newName) {
      toast.error('Asset Name is required');
      return;
    }

    const assetData = {
      name: newName,
      category: newCategory,
      location: newLocation,
      status: newStatus,
      department: newDept,
      assignedTo: newAssigned,
      documents: ['manual.pdf']
    };

    const newId = await registerAsset(assetData);
    toast.success(`Asset ${newId} registered successfully!`);
    setIsRegisterModalOpen(false);
    
    // Reset Form
    setNewName('');
    setNewCategory('Laptops');
    setNewLocation('Warehouse');
    setNewStatus('Available');
    setNewDept('');
    setNewAssigned('');
  };

  // Filtered Assets list
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.qrCode && asset.qrCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedFilters.category || asset.category === selectedFilters.category;
    const matchesStatus = !selectedFilters.status || asset.status === selectedFilters.status;
    const matchesDept = !selectedFilters.department || asset.department === selectedFilters.department;

    return matchesSearch && matchesCategory && matchesStatus && matchesDept;
  });

  const columns = [
    { key: 'id', label: 'Asset Tag', sortable: true, width: '12%' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true, width: '15%' },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      width: '15%',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'location', label: 'Location', sortable: true, width: '15%' },
    { key: 'department', label: 'Department', sortable: true, width: '15%', render: (row) => row.department || '-' },
    {
      key: 'actions',
      label: 'View',
      width: '8%',
      render: (row) => (
        <button 
          className="btn-view-details"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAsset(row);
          }}
          aria-label="View asset details"
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  // Search filter configuration
  const filterConfig = [
    { 
      name: 'category', 
      label: 'Category', 
      options: categories.map(c => c.name) 
    },
    { 
      name: 'status', 
      label: 'Status', 
      options: ['Available', 'Allocated', 'Reserved', 'Maintenance', 'Lost', 'Retired', 'Disposed'] 
    },
    { 
      name: 'department', 
      label: 'Department', 
      options: departments.map(d => d.name) 
    }
  ];

  return (
    <div className="asset-registration-page">
      <div className="assets-header-row">
        <div>
          <h1 className="page-heading">Asset Registrations</h1>
          <p className="page-subheading">Manage equipment inventory, track lifecycles, and view logs.</p>
        </div>
      </div>

      {/* Search & Actions */}
      <SearchBar 
        placeholder="Search by tag, name, or QR code..."
        value={searchTerm}
        onChange={setSearchTerm}
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        selectedFilters={selectedFilters}
        actionButton={
          <button 
            className="btn btn-primary"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <PlusCircle size={16} />
            Register Asset
          </button>
        }
      />

      {/* Assets Table */}
      <DataTable 
        columns={columns}
        data={filteredAssets}
        itemsPerPage={5}
        initialSortKey="id"
        initialSortDirection="desc"
        onRowClick={(row) => setSelectedAsset(row)}
      />

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        title={`Asset Details: ${selectedAsset?.id}`}
        size="lg"
      >
        {selectedAsset && (
          <div className="asset-details-grid">
            <div className="details-main-panel">
              <div className="details-header">
                <h3>{selectedAsset.name}</h3>
                <StatusBadge status={selectedAsset.status} />
              </div>

              <div className="details-info-grid">
                <div className="info-item">
                  <span className="info-label">Category</span>
                  <span className="info-value">{selectedAsset.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{selectedAsset.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{selectedAsset.department || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Assigned To</span>
                  <span className="info-value">{selectedAsset.assignedTo || 'Unassigned'}</span>
                </div>
              </div>

              <div className="details-section">
                <h4 className="section-title">Documents</h4>
                <div className="documents-list">
                  {selectedAsset.documents && selectedAsset.documents.length > 0 ? (
                    selectedAsset.documents.map((doc, idx) => (
                      <a href="#" key={idx} className="doc-link" onClick={(e) => { e.preventDefault(); toast.success(`Downloading ${doc}`); }}>
                        <FileText size={16} />
                        <span>{doc}</span>
                      </a>
                    ))
                  ) : (
                    <span className="no-docs-text">No documents uploaded</span>
                  )}
                </div>
              </div>

              {/* History Chronology */}
              <div className="details-section">
                <h4 className="section-title">Asset History Log</h4>
                <div className="history-chronology">
                  {selectedAsset.history.map((log, idx) => (
                    <div key={idx} className="history-log-item">
                      <div className="log-bullet"></div>
                      <div className="log-content">
                        <div className="log-meta">
                          <span className="log-action">{log.action}</span>
                          <span className="log-date">
                            <Calendar size={12} />
                            {log.date}
                          </span>
                        </div>
                        <p className="log-notes">{log.notes}</p>
                        <span className="log-actor">
                          <User size={12} />
                          By {log.performedBy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar with QR code */}
            <div className="details-side-panel">
              <h4 className="section-title">Asset QR Code</h4>
              <div className="qr-code-card">
                <div className="qr-placeholder">
                  <QrCode size={120} strokeWidth={1.5} />
                </div>
                <span className="qr-serial">{selectedAsset.qrCode || selectedAsset.id}</span>
                <p className="qr-tip">Scan tag in field to instantly retrieve lifecycle history details.</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Registration Form Modal */}
      <Modal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        title="Register New Asset"
      >
        <form onSubmit={handleRegisterSubmit} className="register-asset-form">
          <div className="form-group">
            <label className="form-label">Asset Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Dell XPS Laptop, Office Desk" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Desk Number</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Desk 102, Floor 3" 
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>

          {newStatus === 'Allocated' && (
            <div className="form-grid-row">
              <div className="form-group">
                <label className="form-label">Assign To (Employee)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Priya Shah" 
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-input"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  required
                >
                  <option value="">Select Dept...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Upload Documents (PDF / Specifications)</label>
            <div className="file-upload-placeholder" onClick={() => toast.success('File attachments select triggered!')}>
              <PlusCircle size={20} />
              <span>Attach warranty documentation, receipts or specs sheet</span>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetRegistration;
=======
import React, { useState } from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import DataTable from '../../components/layout/DataTable';
import SearchBar from '../../components/layout/SearchBar';
import Modal from '../../components/layout/Modal';
import StatusBadge from '../../components/layout/StatusBadge';
import toast from 'react-hot-toast';
import { PlusCircle, QrCode, FileText, Calendar, User, Eye } from 'lucide-react';
import './AssetRegistration.css';

const AssetRegistration = () => {
  const { assets, categories, departments, registerAsset, currentUser } = useAssetFlow();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    status: '',
    department: ''
  });

  // Modal control
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Laptops');
  const [newLocation, setNewLocation] = useState('Warehouse');
  const [newStatus, setNewStatus] = useState('Available');
  const [newDept, setNewDept] = useState('');
  const [newAssigned, setNewAssigned] = useState('');

  const handleFilterChange = (name, value) => {
    setSelectedFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newName) {
      toast.error('Asset Name is required');
      return;
    }

    const assetData = {
      name: newName,
      category: newCategory,
      location: newLocation,
      status: newStatus,
      department: newDept,
      assignedTo: newAssigned,
      documents: ['manual.pdf']
    };

    const newId = registerAsset(assetData);
    toast.success(`Asset ${newId} registered successfully!`);
    setIsRegisterModalOpen(false);
    
    // Reset Form
    setNewName('');
    setNewCategory('Laptops');
    setNewLocation('Warehouse');
    setNewStatus('Available');
    setNewDept('');
    setNewAssigned('');
  };

  // Filtered Assets list
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.qrCode && asset.qrCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedFilters.category || asset.category === selectedFilters.category;
    const matchesStatus = !selectedFilters.status || asset.status === selectedFilters.status;
    const matchesDept = !selectedFilters.department || asset.department === selectedFilters.department;

    return matchesSearch && matchesCategory && matchesStatus && matchesDept;
  });

  const columns = [
    { key: 'id', label: 'Asset Tag', sortable: true, width: '12%' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true, width: '15%' },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      width: '15%',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'location', label: 'Location', sortable: true, width: '15%' },
    { key: 'department', label: 'Department', sortable: true, width: '15%', render: (row) => row.department || '-' },
    {
      key: 'actions',
      label: 'View',
      width: '8%',
      render: (row) => (
        <button 
          className="btn-view-details"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAsset(row);
          }}
          aria-label="View asset details"
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  // Search filter configuration
  const filterConfig = [
    { 
      name: 'category', 
      label: 'Category', 
      options: categories.map(c => c.name) 
    },
    { 
      name: 'status', 
      label: 'Status', 
      options: ['Available', 'Allocated', 'Reserved', 'Maintenance', 'Lost', 'Retired', 'Disposed'] 
    },
    { 
      name: 'department', 
      label: 'Department', 
      options: departments.map(d => d.name) 
    }
  ];

  return (
    <div className="asset-registration-page">
      <div className="assets-header-row">
        <div>
          <h1 className="page-heading">Asset Registrations</h1>
          <p className="page-subheading">Manage equipment inventory, track lifecycles, and view logs.</p>
        </div>
      </div>

      {/* Search & Actions */}
      <SearchBar 
        placeholder="Search by tag, name, or QR code..."
        value={searchTerm}
        onChange={setSearchTerm}
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        selectedFilters={selectedFilters}
        actionButton={
          <button 
            className="btn btn-primary"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <PlusCircle size={16} />
            Register Asset
          </button>
        }
      />

      {/* Assets Table */}
      <DataTable 
        columns={columns}
        data={filteredAssets}
        itemsPerPage={5}
        initialSortKey="id"
        initialSortDirection="desc"
        onRowClick={(row) => setSelectedAsset(row)}
      />

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        title={`Asset Details: ${selectedAsset?.id}`}
        size="lg"
      >
        {selectedAsset && (
          <div className="asset-details-grid">
            <div className="details-main-panel">
              <div className="details-header">
                <h3>{selectedAsset.name}</h3>
                <StatusBadge status={selectedAsset.status} />
              </div>

              <div className="details-info-grid">
                <div className="info-item">
                  <span className="info-label">Category</span>
                  <span className="info-value">{selectedAsset.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{selectedAsset.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{selectedAsset.department || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Assigned To</span>
                  <span className="info-value">{selectedAsset.assignedTo || 'Unassigned'}</span>
                </div>
              </div>

              <div className="details-section">
                <h4 className="section-title">Documents</h4>
                <div className="documents-list">
                  {selectedAsset.documents && selectedAsset.documents.length > 0 ? (
                    selectedAsset.documents.map((doc, idx) => (
                      <a href="#" key={idx} className="doc-link" onClick={(e) => { e.preventDefault(); toast.success(`Downloading ${doc}`); }}>
                        <FileText size={16} />
                        <span>{doc}</span>
                      </a>
                    ))
                  ) : (
                    <span className="no-docs-text">No documents uploaded</span>
                  )}
                </div>
              </div>

              {/* History Chronology */}
              <div className="details-section">
                <h4 className="section-title">Asset History Log</h4>
                <div className="history-chronology">
                  {selectedAsset.history.map((log, idx) => (
                    <div key={idx} className="history-log-item">
                      <div className="log-bullet"></div>
                      <div className="log-content">
                        <div className="log-meta">
                          <span className="log-action">{log.action}</span>
                          <span className="log-date">
                            <Calendar size={12} />
                            {log.date}
                          </span>
                        </div>
                        <p className="log-notes">{log.notes}</p>
                        <span className="log-actor">
                          <User size={12} />
                          By {log.performedBy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar with QR code */}
            <div className="details-side-panel">
              <h4 className="section-title">Asset QR Code</h4>
              <div className="qr-code-card">
                <div className="qr-placeholder">
                  <QrCode size={120} strokeWidth={1.5} />
                </div>
                <span className="qr-serial">{selectedAsset.qrCode || selectedAsset.id}</span>
                <p className="qr-tip">Scan tag in field to instantly retrieve lifecycle history details.</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Registration Form Modal */}
      <Modal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        title="Register New Asset"
      >
        <form onSubmit={handleRegisterSubmit} className="register-asset-form">
          <div className="form-group">
            <label className="form-label">Asset Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Dell XPS Laptop, Office Desk" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Desk Number</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Desk 102, Floor 3" 
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>

          {newStatus === 'Allocated' && (
            <div className="form-grid-row">
              <div className="form-group">
                <label className="form-label">Assign To (Employee)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Priya Shah" 
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-input"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  required
                >
                  <option value="">Select Dept...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Upload Documents (PDF / Specifications)</label>
            <div className="file-upload-placeholder" onClick={() => toast.success('File attachments select triggered!')}>
              <PlusCircle size={20} />
              <span>Attach warranty documentation, receipts or specs sheet</span>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetRegistration;
>>>>>>> 10c09149142baf4187e54802525760fd01a985ee:frontend/src/pages/AssetRegistration/AssetRegistration.jsx
