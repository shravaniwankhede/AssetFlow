import React, { useState } from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import DataTable from '../../components/layout/DataTable';
import toast from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';
import './OrganizationSetup.css';

const OrganizationSetup = () => {
  const { 
    currentUser, 
    departments, 
    categories, 
    usersList, 
    addDepartment, 
    toggleDepartmentStatus, 
    addCategory, 
    addEmployee,
    promoteUser, 
    deactivateEmployee 
  } = useAssetFlow();

  const [activeTab, setActiveTab] = useState('departments');
  
  // New Department Form State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptParent, setNewDeptParent] = useState('-');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Employee');
  const [newEmpDept, setNewEmpDept] = useState(departments[0]?.name || 'Engineering');

  // Handle department submit
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!newDeptName) {
      toast.error('Department name is required');
      return;
    }
    await addDepartment(newDeptName, newDeptHead || '-', newDeptParent);
    toast.success(`Department "${newDeptName}" created!`);
    setNewDeptName('');
    setNewDeptHead('');
    setNewDeptParent('-');
  };

  // Handle category submit
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!newCatName) {
      toast.error('Category name is required');
      return;
    }
    await addCategory(newCatName, newCatDesc);
    toast.success(`Category "${newCatName}" created!`);
    setNewCatName('');
    setNewCatDesc('');
  };

  // Handle employee submit
  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail) {
      toast.error('Name and email are required');
      return;
    }
    const res = await addEmployee(newEmpName, newEmpEmail, newEmpRole, newEmpDept);
    if (res && res.success) {
      toast.success(`Employee "${newEmpName}" registered!`);
      setNewEmpName('');
      setNewEmpEmail('');
      setNewEmpRole('Employee');
      setNewEmpDept(departments[0]?.name || 'Engineering');
    } else {
      toast.error(res?.message || 'Registration failed');
    }
  };

  const handleRolePromotion = async (empId, newRole, empName) => {
    const res = await promoteUser(empId, newRole);
    if (res && res.success) {
      toast.success(`${empName} promoted to ${newRole}!`);
    } else {
      toast.error(res?.message || 'Promotion failed');
    }
  };

  const handleDeactivate = async (empId, empName) => {
    const res = await deactivateEmployee(empId);
    if (res && res.success) {
      toast.success(`${empName} account has been deactivated.`);
    } else {
      toast.error(res?.message || 'Deactivation failed');
    }
  };

  // Columns Definitions
  const deptColumns = [
    { key: 'name', label: 'NAME', sortable: true },
    { key: 'head', label: 'HEAD', sortable: true },
    { key: 'parentDept', label: 'PARENT', sortable: true },
    { 
      key: 'status', 
      label: 'STATUS', 
      render: (row) => (
        <span className={`status-pill ${row.status.toLowerCase()}`}>
          ● {row.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (row) => (
        <button 
          className={`btn-toggle-status ${row.status === 'Active' ? 'deactivate' : 'activate'}`}
          onClick={() => toggleDepartmentStatus(row.id)}
        >
          {row.status === 'Active' ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  const catColumns = [
    { key: 'name', label: 'NAME', sortable: true, width: '30%' },
    { key: 'description', label: 'DESCRIPTION', sortable: false, width: '70%' }
  ];

  const empColumns = [
    { key: 'name', label: 'NAME', sortable: true },
    { key: 'email', label: 'EMAIL', sortable: true },
    { key: 'department', label: 'DEPARTMENT', sortable: true },
    { 
      key: 'role', 
      label: 'ROLE', 
      render: (row) => (
        <span className={`role-badge ${row.role.replace(/\s+/g, '').toLowerCase()}`}>
          {row.role}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'STATUS', 
      render: (row) => (
        <span className={`status-pill ${row.status.toLowerCase()}`}>
          ● {row.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'ADMIN CONTROL',
      render: (row) => {
        const isAdmin = currentUser?.role === 'Admin';
        
        return (
          <div className="admin-actions-cell">
            <select
              className="role-select"
              value={row.role}
              disabled={!isAdmin || row.id === currentUser?.id}
              onChange={(e) => handleRolePromotion(row.id, e.target.value, row.name)}
            >
              <option value="Employee">Employee</option>
              <option value="Department Head">Department Head</option>
              <option value="Asset Manager">Asset Manager</option>
              <option value="Admin">Admin</option>
            </select>
            {row.status === 'Active' ? (
              <button
                className="btn-deactivate"
                disabled={!isAdmin || row.id === currentUser?.id}
                onClick={() => handleDeactivate(row.id, row.name)}
              >
                Deactivate
              </button>
            ) : (
              <span className="deactivated-label">Deactivated</span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="org-setup-page">
      <div className="org-header-row">
        <div>
          <h1 className="page-heading">Organization setup</h1>
          <p className="page-subheading">Master data — everything else in the system depends on these.</p>
        </div>
        {currentUser?.role !== 'Admin' && (
          <div className="admin-only-banner">
            <ShieldAlert size={14} />
            <span>Adding and managing organization structures is restricted to Admins.</span>
          </div>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="org-tabs">
        <button 
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Asset Categories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Directory
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="org-setup-content-grid">
        {/* Left Side: Create Form */}
        <div className="card org-form-card">
          {activeTab === 'departments' && (
            <form onSubmit={handleDeptSubmit} className="org-inline-form">
              <h3 className="form-card-title">New department</h3>
              
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Department name" 
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <select 
                  className="form-input"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                >
                  <option value="">— Assign head (optional) —</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <select 
                  className="form-input"
                  value={newDeptParent}
                  onChange={(e) => setNewDeptParent(e.target.value)}
                >
                  <option value="-">— Parent department (optional) —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary form-submit-btn">
                + Add department
              </button>
            </form>
          )}

          {activeTab === 'categories' && (
            <form onSubmit={handleCatSubmit} className="org-inline-form">
              <h3 className="form-card-title">New category</h3>
              
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Category name" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <textarea 
                  className="form-input text-area-input" 
                  placeholder="Category description" 
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary form-submit-btn">
                + Add category
              </button>
            </form>
          )}

          {activeTab === 'employees' && (
            <form onSubmit={handleEmpSubmit} className="org-inline-form">
              <h3 className="form-card-title">New employee</h3>
              
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Employee name" 
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Email address" 
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <select 
                  className="form-input"
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                >
                  <option value="">— Select department —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <select 
                  className="form-input"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                >
                  <option value="Employee">Employee</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary form-submit-btn">
                + Add employee
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Data Listing Card */}
        <div className="card org-table-card">
          {activeTab === 'departments' && (
            <DataTable 
              columns={deptColumns} 
              data={departments} 
              itemsPerPage={6}
              initialSortKey="name"
            />
          )}

          {activeTab === 'categories' && (
            <DataTable 
              columns={catColumns} 
              data={categories} 
              itemsPerPage={6}
              initialSortKey="name"
            />
          )}

          {activeTab === 'employees' && (
            <DataTable 
              columns={empColumns} 
              data={usersList} 
              itemsPerPage={6}
              initialSortKey="name"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSetup;
