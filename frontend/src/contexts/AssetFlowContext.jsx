import React, { createContext, useState, useEffect, useContext } from 'react';

const AssetFlowContext = createContext();

// Helper to load/save state from localStorage
const getLocalData = (key, fallback) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error parsing localStorage key ${key}`, e);
    }
  }
  return fallback;
};

const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const AssetFlowProvider = ({ children }) => {
  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState(() => getLocalData('af_user', null));
  const [usersList, setUsersList] = useState(() => getLocalData('af_users', [
    { id: 'emp-1', name: 'Admin User', email: 'admin@company.com', password: 'password', role: 'Admin', department: 'Operations', status: 'Active' },
    { id: 'emp-2', name: 'Priya Shah', email: 'priya@company.com', password: 'password', role: 'Employee', department: 'Engineering', status: 'Active' },
    { id: 'emp-3', name: 'Amit Patel', email: 'amit@company.com', password: 'password', role: 'Department Head', department: 'Engineering', status: 'Active' },
    { id: 'emp-4', name: 'Sam Iqbal', email: 'sam@company.com', password: 'password', role: 'Department Head', department: 'Operations', status: 'Active' },
    { id: 'emp-5', name: 'A. Khan', email: 'khan@company.com', password: 'password', role: 'Asset Manager', department: 'Operations', status: 'Active' },
    { id: 'emp-6', name: 'Priya Sharma', email: 'sharma@company.com', password: 'password', role: 'Department Head', department: 'HR', status: 'Active' },
    { id: 'emp-7', name: 'Raj Kumar', email: 'raj@company.com', password: 'password', role: 'Employee', department: 'Engineering', status: 'Active' },
  ]));

  // --- ORGANIZATION SETUP STATE ---
  const [departments, setDepartments] = useState(() => getLocalData('af_departments', [
    { id: 'dept-1', name: 'Engineering', head: 'Amit Patel', parentDept: '-', status: 'Active' },
    { id: 'dept-2', name: 'HR', head: 'Priya Sharma', parentDept: '-', status: 'Active' },
    { id: 'dept-3', name: 'Finance', head: 'Rajeev Mehta', parentDept: '-', status: 'Active' },
    { id: 'dept-4', name: 'Operations', head: 'Sam Iqbal', parentDept: '-', status: 'Active' },
  ]));

  const [categories, setCategories] = useState(() => getLocalData('af_categories', [
    { id: 'cat-1', name: 'Laptops', description: 'Portable workstation computers' },
    { id: 'cat-2', name: 'Monitors', description: 'Display screens and TVs' },
    { id: 'cat-3', name: 'Vehicles', description: 'Corporate cars, delivery vans' },
    { id: 'cat-4', name: 'Furniture', description: 'Desks, chairs, filing systems' },
    { id: 'cat-5', name: 'Electronics', description: 'Projectors, webcams, printers' },
  ]));

  // --- ASSETS STATE ---
  const [assets, setAssets] = useState(() => getLocalData('af_assets', [
    {
      id: 'AF-0012',
      name: 'Dell XPS 15 Laptop',
      category: 'Laptops',
      status: 'Allocated',
      location: 'Desk 412',
      assignedTo: 'Priya Shah',
      department: 'Engineering',
      image: '',
      documents: ['specs.pdf'],
      history: [
        { date: '2026-06-10', action: 'Registered', performedBy: 'Admin User', notes: 'Initial registration' },
        { date: '2026-06-12', action: 'Allocated', performedBy: 'A. Khan', notes: 'Assigned to Priya Shah' },
      ],
      qrCode: 'AF-0012-DELLXPS'
    },
    {
      id: 'AF-0055',
      name: 'MacBook Pro 16',
      category: 'Laptops',
      status: 'Available',
      location: 'Warehouse',
      assignedTo: '',
      department: '',
      image: '',
      documents: [],
      history: [{ date: '2026-06-20', action: 'Registered', performedBy: 'Admin User', notes: 'Brand new unit' }],
      qrCode: 'AF-0055-MBP16'
    },
    {
      id: 'AF-0082',
      name: 'Epson Projector',
      category: 'Electronics',
      status: 'Maintenance',
      location: 'Room 102',
      assignedTo: '',
      department: 'Operations',
      image: '',
      documents: [],
      history: [
        { date: '2026-07-01', action: 'Registered', performedBy: 'Admin User', notes: 'Conference room equipment' },
        { date: '2026-07-12', action: 'Sent to Maintenance', performedBy: 'Sam Iqbal', notes: 'Bulb flickering issue' },
      ],
      qrCode: 'AF-0082-EPSON'
    },
    {
      id: 'AF-0099',
      name: 'Company Tesla Model 3',
      category: 'Vehicles',
      status: 'Allocated',
      location: 'HQ Gate 2',
      assignedTo: 'Sam Iqbal',
      department: 'Operations',
      image: '',
      documents: ['insurance.pdf'],
      history: [
        { date: '2026-05-01', action: 'Registered', performedBy: 'Admin User', notes: 'Fleet purchase' },
        { date: '2026-05-05', action: 'Allocated', performedBy: 'Admin User', notes: 'Assigned to Sam Iqbal' }
      ],
      qrCode: 'AF-0099-TESLA3'
    },
    {
      id: 'AF-0114',
      name: 'Dell Latitude 5420',
      category: 'Laptops',
      status: 'Allocated',
      location: 'Desk 415',
      assignedTo: 'Priya Shah',
      department: 'Engineering',
      image: '',
      documents: [],
      history: [
        { date: '2026-07-02', action: 'Registered', performedBy: 'A. Khan', notes: 'IT asset stock' },
        { date: '2026-07-05', action: 'Allocated', performedBy: 'A. Khan', notes: 'Assigned to Priya Shah' },
      ],
      qrCode: 'AF-0114-DELL5420'
    },
    {
      id: 'AF-0221',
      name: 'Office Ergonomic Chair',
      category: 'Furniture',
      status: 'Available',
      location: 'Warehouse',
      assignedTo: '',
      department: '',
      image: '',
      documents: [],
      history: [{ date: '2026-07-08', action: 'Registered', performedBy: 'Admin User', notes: 'Stock order' }],
      qrCode: 'AF-0221-CHAIR'
    },
    {
      id: 'AF-0310',
      name: 'HP Laserjet Printer',
      category: 'Electronics',
      status: 'Available',
      location: 'HQ Floor 2',
      assignedTo: '',
      department: 'HR',
      image: '',
      documents: [],
      history: [{ date: '2026-06-15', action: 'Registered', performedBy: 'Admin User', notes: 'Floor setup' }],
      qrCode: 'AF-0310-PRINTER'
    },
    {
      id: 'AF-0021',
      name: 'Office Steel Frame Desk',
      category: 'Furniture',
      status: 'Available',
      location: 'Desk 419',
      assignedTo: '',
      department: 'Engineering',
      image: '',
      documents: [],
      history: [{ date: '2026-06-01', action: 'Registered', performedBy: 'Admin User', notes: 'Asset audit item' }],
      qrCode: 'AF-0021-DESK'
    },
    {
      id: 'AF-0098',
      name: 'Logitech Web Camera Pro',
      category: 'Electronics',
      status: 'Available',
      location: 'Desk 410',
      assignedTo: '',
      department: 'Engineering',
      image: '',
      documents: [],
      history: [{ date: '2026-07-03', action: 'Registered', performedBy: 'Admin User', notes: 'Asset audit item' }],
      qrCode: 'AF-0098-LOGICAM'
    }
  ]));

  // --- TRANSFERS STATE ---
  const [transfers, setTransfers] = useState(() => getLocalData('af_transfers', [
    { id: 'tr-1', assetId: 'AF-0114', assetName: 'Dell Latitude 5420', fromEmployee: 'Priya Shah', toEmployee: 'Raj Kumar', reason: 'Developer setup required urgently', status: 'Pending', timestamp: '2026-07-12T08:30:00Z' }
  ]));

  // --- RESOURCE BOOKINGS STATE ---
  const [bookings, setBookings] = useState(() => getLocalData('af_bookings', [
    { id: 'bk-1', resource: 'Conference Room 301', title: 'Procurement Team', startTime: '09:00', endTime: '10:00', bookedBy: 'Procurement Team', date: '2026-07-12', status: 'Upcoming' },
    { id: 'bk-2', resource: 'Conference Room 301', title: 'Marketing Sync', startTime: '09:30', endTime: '10:30', bookedBy: 'Marketing Team', date: '2026-07-12', status: 'Conflict' }
  ]));

  const [bookingResources] = useState([
    { id: 'res-1', name: 'Conference room B2', location: 'Building B, Floor 2' },
    { id: 'res-2', name: 'Projector AF-0082', location: 'IT Department' },
    { id: 'res-3', name: 'Company Tesla Model 3', location: 'Garage Gate 2' },
  ]);

  // --- MAINTENANCE TICKETS STATE ---
  const [maintenanceTickets, setMaintenanceTickets] = useState(() => getLocalData('af_maintenance', [
    { id: 'maint-1', assetId: 'AF-0082', title: 'Projector bulb not working', notes: 'Light turns red and shuts down', status: 'Pending', technician: '', dateReported: '2026-07-11' },
    { id: 'maint-2', assetId: 'AF-0055', title: 'MacBook Pro screen flicker', notes: 'Display flickers at low brightness', status: 'Approved', technician: 'Tech Support Team', dateReported: '2026-07-12' },
    { id: 'maint-3', assetId: 'AF-0099', title: 'Tesla AC malfunctioning', notes: 'AC blowing hot air periodically', status: 'Technician Assigned', technician: 'External Garage Service', dateReported: '2026-07-10' },
    { id: 'maint-4', assetId: 'AF-0310', title: 'Printer Jam - parts ordered', notes: 'Roller replacement needed', status: 'In Progress', technician: 'Facilities Repair', dateReported: '2026-07-09' },
    { id: 'maint-5', assetId: 'AF-0221', title: 'Chair structural weld repair', notes: 'Base weld cracked', status: 'Resolved', technician: 'Internal Repair Team', dateReported: '2026-07-03' }
  ]));

  // --- AUDITS STATE ---
  const [audits, setAudits] = useState(() => getLocalData('af_audits', [
    {
      id: 'aud-1',
      title: 'Q2 Audit: Engineering Dept',
      itemCount: 142,
      auditors: ['A. Khan', 'Sam Iqbal'],
      status: 'Ongoing',
      dateCreated: '2026-07-10',
      items: [
        { assetId: 'AF-0114', name: 'Dell Latitude 5420', location: 'Desk 415', verification: 'Verified' },
        { assetId: 'AF-0021', name: 'Office Steel Frame Desk', location: 'Desk 419', verification: 'Missing' },
        { assetId: 'AF-0098', name: 'Logitech Web Camera Pro', location: 'Desk 410', verification: 'Damaged' },
      ],
      discrepancyReportGenerated: true
    }
  ]));

  // --- NOTIFICATIONS & ACTIVITY LOGS ---
  const [notifications, setNotifications] = useState(() => getLocalData('af_notifications', [
    { id: 'n-1', type: 'Asset Assigned', message: 'Laptop AF-0114 assigned to Priya Shah', time: '3m ago', category: 'Alerts', read: false },
    { id: 'n-2', type: 'Maintenance Approved', message: 'Maintenance request AF-0055 approved', time: '15m ago', category: 'Approvals', read: false },
    { id: 'n-3', type: 'Booking Confirmed', message: 'Booking confirmed: Room 301 : 2:00 to 3:00 PM', time: '1h ago', category: 'Bookings', read: true },
    { id: 'n-4', type: 'Transfer Approved', message: 'Transfer approved: AF-0023 to facilities dept', time: '3h ago', category: 'Approvals', read: true },
    { id: 'n-5', type: 'Overdue Return', message: 'Overdue return: AF-0021 was due 3 days ago', time: '1d ago', category: 'Alerts', read: false },
    { id: 'n-6', type: 'Audit Discrepancy', message: 'Audit discrepancy flagged: AF-0098 damaged', time: '2d ago', category: 'Alerts', read: true },
  ]));

  // Save changes to localStorage
  useEffect(() => {
    setLocalData('af_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setLocalData('af_users', usersList);
  }, [usersList]);

  useEffect(() => {
    setLocalData('af_departments', departments);
  }, [departments]);

  useEffect(() => {
    setLocalData('af_categories', categories);
  }, [categories]);

  useEffect(() => {
    setLocalData('af_assets', assets);
  }, [assets]);

  useEffect(() => {
    setLocalData('af_transfers', transfers);
  }, [transfers]);

  useEffect(() => {
    setLocalData('af_bookings', bookings);
  }, [bookings]);

  useEffect(() => {
    setLocalData('af_maintenance', maintenanceTickets);
  }, [maintenanceTickets]);

  useEffect(() => {
    setLocalData('af_audits', audits);
  }, [audits]);

  useEffect(() => {
    setLocalData('af_notifications', notifications);
  }, [notifications]);

  // --- ACTIONS & BUSINESS LOGIC ---

  // Auth Operations
  const login = (email, password) => {
    const existing = usersList.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (existing) {
      if (existing.status === 'Inactive') {
        return { success: false, message: 'Your account is deactivated. Please contact an Admin.' };
      }
      setCurrentUser(existing);
      addNotification('Alerts', `User ${existing.name} logged in successfully`, 'Just now');
      return { success: true, user: existing };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const signup = (name, email, password) => {
    const exists = usersList.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email already registered' };
    }
    const newUser = {
      id: `emp-${usersList.length + 1}`,
      name,
      email,
      password,
      role: 'Employee', // Strict Rule: signup always creates Employee
      department: 'Engineering',
      status: 'Active'
    };
    setUsersList([...usersList, newUser]);
    addNotification('Alerts', `New Employee account registered: ${name}`, 'Just now');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const promoteUser = (employeeId, newRole) => {
    if (currentUser?.role !== 'Admin') {
      return { success: false, message: 'Permission denied: Only Admin can promote users' };
    }
    setUsersList(prev => prev.map(u => {
      if (u.id === employeeId) {
        addNotification('Approvals', `Role promotion: ${u.name} promoted to ${newRole}`, 'Just now');
        return { ...u, role: newRole };
      }
      return u;
    }));
    return { success: true };
  };

  const deactivateEmployee = (employeeId) => {
    if (currentUser?.role !== 'Admin') {
      return { success: false, message: 'Permission denied' };
    }
    setUsersList(prev => prev.map(u => {
      if (u.id === employeeId) {
        addNotification('Alerts', `Employee ${u.name} deactivated`, 'Just now');
        return { ...u, status: 'Inactive' };
      }
      return u;
    }));
    return { success: true };
  };

  const addEmployee = (name, email, role, department) => {
    const exists = usersList.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email already registered' };
    }
    const newUser = {
      id: `emp-${usersList.length + 1}`,
      name,
      email,
      password: 'password123',
      role,
      department,
      status: 'Active'
    };
    setUsersList([...usersList, newUser]);
    addNotification('Alerts', `New Employee registered: ${name}`, 'Just now');
    return { success: true };
  };

  // Departments Operations
  const addDepartment = (name, head, parentDept) => {
    const newDept = {
      id: `dept-${departments.length + 1}`,
      name,
      head: head || '-',
      parentDept: parentDept || '-',
      status: 'Active'
    };
    setDepartments([...departments, newDept]);
    addNotification('Alerts', `Created Department: ${name}`, 'Just now');
  };

  const updateDepartment = (id, updatedFields) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
  };

  const toggleDepartmentStatus = (id) => {
    setDepartments(prev => prev.map(d => {
      if (d.id === id) {
        const newStatus = d.status === 'Active' ? 'Inactive' : 'Active';
        addNotification('Alerts', `Department ${d.name} set to ${newStatus}`, 'Just now');
        return { ...d, status: newStatus };
      }
      return d;
    }));
  };

  // Categories Operations
  const addCategory = (name, description) => {
    const newCat = {
      id: `cat-${categories.length + 1}`,
      name,
      description
    };
    setCategories([...categories, newCat]);
    addNotification('Alerts', `Created Category: ${name}`, 'Just now');
  };

  // Asset Registration Operations
  const registerAsset = (assetData) => {
    // Auto generate Asset ID (e.g. AF-XXXX)
    const activeNumbers = assets.map(a => parseInt(a.id.replace('AF-', '')));
    const nextNumber = Math.max(...activeNumbers, 0) + 1;
    const formattedId = `AF-${nextNumber.toString().padStart(4, '0')}`;

    const newAsset = {
      id: formattedId,
      name: assetData.name,
      category: assetData.category,
      status: assetData.status || 'Available',
      location: assetData.location || 'Warehouse',
      assignedTo: assetData.assignedTo || '',
      department: assetData.department || '',
      image: assetData.image || '',
      documents: assetData.documents || [],
      history: [{ date: new Date().toISOString().split('T')[0], action: 'Registered', performedBy: currentUser?.name || 'System', notes: 'Asset registered' }],
      qrCode: `${formattedId}-${assetData.name.replace(/\s+/g, '').toUpperCase()}`
    };

    setAssets([newAsset, ...assets]);
    addNotification('Alerts', `Asset registered successfully: ${formattedId}`, 'Just now');
    return formattedId;
  };

  const updateAssetStatus = (assetId, newStatus, notes = '') => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const historyEntry = {
          date: new Date().toISOString().split('T')[0],
          action: `Status Change: ${newStatus}`,
          performedBy: currentUser?.name || 'System',
          notes: notes || `Status updated to ${newStatus}`
        };
        return {
          ...a,
          status: newStatus,
          history: [historyEntry, ...a.history]
        };
      }
      return a;
    }));
  };

  // Asset Allocation Operations
  const allocateAsset = (assetId, employeeName, notes = '') => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    // Strict double-allocation block:
    if (asset.status === 'Allocated' && asset.assignedTo) {
      return {
        success: false,
        message: `This asset is already allocated to ${asset.assignedTo}.`,
        isAllocated: true,
        currentHolder: asset.assignedTo
      };
    }

    // Allocate asset
    const employeeObj = usersList.find(u => u.name === employeeName);
    const dept = employeeObj?.department || 'Operations';

    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const historyEntry = {
          date: new Date().toISOString().split('T')[0],
          action: 'Allocated',
          performedBy: currentUser?.name || 'System',
          notes: notes || `Assigned to ${employeeName}`
        };
        return {
          ...a,
          status: 'Allocated',
          assignedTo: employeeName,
          department: dept,
          history: [historyEntry, ...a.history]
        };
      }
      return a;
    }));

    addNotification('Alerts', `Asset ${assetId} assigned to ${employeeName}`, 'Just now');
    return { success: true };
  };

  const deallocateAsset = (assetId, conditionNotes = '') => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const historyEntry = {
          date: new Date().toISOString().split('T')[0],
          action: 'Returned',
          performedBy: currentUser?.name || 'System',
          notes: `Returned. Condition: ${conditionNotes || 'Good'}`
        };
        return {
          ...a,
          status: 'Available',
          assignedTo: '',
          department: '',
          history: [historyEntry, ...a.history]
        };
      }
      return a;
    }));
    addNotification('Alerts', `Asset ${assetId} returned to warehouse`, 'Just now');
  };

  // Raise Transfer Request
  const createTransferRequest = (assetId, toEmployee, reason) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    const newTransfer = {
      id: `tr-${transfers.length + 1}`,
      assetId,
      assetName: asset.name,
      fromEmployee: asset.assignedTo,
      toEmployee,
      reason,
      status: 'Pending',
      timestamp: new Date().toISOString()
    };

    setTransfers([newTransfer, ...transfers]);
    addNotification('Approvals', `Transfer request submitted for ${assetId} to ${toEmployee}`, 'Just now');
    return { success: true };
  };

  const approveTransferRequest = (transferId) => {
    const request = transfers.find(t => t.id === transferId);
    if (!request) return { success: false, message: 'Request not found' };

    // Update asset assignment
    const toEmployeeObj = usersList.find(u => u.name === request.toEmployee);
    const dept = toEmployeeObj?.department || 'Operations';

    setAssets(prev => prev.map(a => {
      if (a.id === request.assetId) {
        const historyEntry = {
          date: new Date().toISOString().split('T')[0],
          action: 'Transferred',
          performedBy: currentUser?.name || 'System',
          notes: `Transferred from ${request.fromEmployee} to ${request.toEmployee}. Reason: ${request.reason}`
        };
        return {
          ...a,
          status: 'Allocated',
          assignedTo: request.toEmployee,
          department: dept,
          history: [historyEntry, ...a.history]
        };
      }
      return a;
    }));

    // Update transfer ticket status
    setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Approved' } : t));
    addNotification('Approvals', `Transfer approved: ${request.assetId} to ${request.toEmployee}`, 'Just now');
    return { success: true };
  };

  const rejectTransferRequest = (transferId) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Rejected' } : t));
    addNotification('Approvals', `Transfer request rejected for ticket ${transferId}`, 'Just now');
  };

  // --- RESOURCE BOOKINGS LOGIC ---
  const createBooking = (resourceName, title, startTime, endTime, dateStr) => {
    // Overlapping booking prevention rule:
    // Parse times to minutes from midnight
    const getMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = getMinutes(startTime);
    const newEnd = getMinutes(endTime);

    if (newStart >= newEnd) {
      return { success: false, message: 'End time must be after start time' };
    }

    const overlap = bookings.some(b => {
      if (b.resource === resourceName && b.date === dateStr && b.status !== 'Cancelled') {
        const bStart = getMinutes(b.startTime);
        const bEnd = getMinutes(b.endTime);
        // Overlap condition: start1 < end2 AND start2 < end1
        return newStart < bEnd && bStart < newEnd;
      }
      return false;
    });

    if (overlap) {
      return {
        success: false,
        message: `Booking overlaps with an existing schedule for ${resourceName}. Double bookings are blocked.`
      };
    }

    const newBooking = {
      id: `bk-${bookings.length + 1}`,
      resource: resourceName,
      title,
      startTime,
      endTime,
      bookedBy: currentUser?.name || 'Employee',
      date: dateStr,
      status: 'Upcoming'
    };

    setBookings([...bookings, newBooking]);
    addNotification('Bookings', `Booking confirmed: ${resourceName} (${startTime} - ${endTime})`, 'Just now');
    return { success: true };
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    addNotification('Bookings', `Booking cancelled for ticket ${bookingId}`, 'Just now');
  };

  // --- MAINTENANCE TICKETS LOGIC (Kanban Board) ---
  const reportMaintenance = (assetId, title, notes) => {
    const newTicket = {
      id: `maint-${maintenanceTickets.length + 1}`,
      assetId,
      title,
      notes,
      status: 'Pending', // pending -> approved -> technician assigned -> in progress -> resolved
      technician: '',
      dateReported: new Date().toISOString().split('T')[0]
    };

    setMaintenanceTickets([...maintenanceTickets, newTicket]);
    
    // Automatically transition Asset Status to "Under Maintenance"
    updateAssetStatus(assetId, 'Maintenance', `Maintenance ticket reported: ${title}`);
    addNotification('Alerts', `Maintenance requested for asset ${assetId}`, 'Just now');
    return { success: true };
  };

  const updateMaintenanceStatus = (ticketId, newStatus, technician = '') => {
    const ticket = maintenanceTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setMaintenanceTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          technician: technician || t.technician
        };
      }
      return t;
    }));

    // If resolved, return asset status to "Available"
    if (newStatus === 'Resolved') {
      updateAssetStatus(ticket.assetId, 'Available', `Maintenance resolved: ${ticket.title}`);
      addNotification('Alerts', `Maintenance resolved for asset ${ticket.assetId}`, 'Just now');
    } else {
      updateAssetStatus(ticket.assetId, 'Maintenance', `Maintenance ticket updated to ${newStatus}`);
    }
  };

  // --- AUDIT LOGIC ---
  const updateAuditItemVerification = (auditId, assetId, verificationStatus) => {
    // verificationStatus: 'Verified', 'Missing', 'Damaged'
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        const updatedItems = a.items.map(item => {
          if (item.assetId === assetId) {
            return { ...item, verification: verificationStatus };
          }
          return item;
        });
        return { ...a, items: updatedItems };
      }
      return a;
    }));
  };

  const closeAudit = (auditId) => {
    const auditObj = audits.find(a => a.id === auditId);
    if (!auditObj) return;

    // Strict Rule: Close audit updates asset statuses based on findings.
    // Verified = stays Allocated/Available, Missing = Lost, Damaged = Maintenance
    auditObj.items.forEach(item => {
      if (item.verification === 'Missing') {
        updateAssetStatus(item.assetId, 'Lost', 'Audit: Flagged as Missing');
      } else if (item.verification === 'Damaged') {
        updateAssetStatus(item.assetId, 'Maintenance', 'Audit: Flagged as Damaged. Undergoing repair review.');
        // Auto-create maintenance ticket
        reportMaintenance(item.assetId, `Audit Damaged Flag: ${item.name}`, 'Flagged as damaged during audit verification.');
      }
    });

    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return { ...a, status: 'Closed' };
      }
      return a;
    }));

    addNotification('Alerts', `Audit closed: ${auditObj.title}. Assets statuses synchronized.`, 'Just now');
  };

  // --- NOTIFICATIONS UTILITY ---
  const addNotification = (category, message, time = 'Just now') => {
    const newNotification = {
      id: `n-${notifications.length + 1}`,
      type: category,
      message,
      time,
      category,
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AssetFlowContext.Provider value={{
      currentUser,
      usersList,
      departments,
      categories,
      assets,
      transfers,
      bookings,
      bookingResources,
      maintenanceTickets,
      audits,
      notifications,
      login,
      signup,
      logout,
      promoteUser,
      deactivateEmployee,
      addEmployee,
      addDepartment,
      updateDepartment,
      toggleDepartmentStatus,
      addCategory,
      registerAsset,
      updateAssetStatus,
      allocateAsset,
      deallocateAsset,
      createTransferRequest,
      approveTransferRequest,
      rejectTransferRequest,
      createBooking,
      cancelBooking,
      reportMaintenance,
      updateMaintenanceStatus,
      updateAuditItemVerification,
      closeAudit,
      addNotification,
      markAllNotificationsRead
    }}>
      {children}
    </AssetFlowContext.Provider>
  );
};

export const useAssetFlow = () => {
  const context = useContext(AssetFlowContext);
  if (!context) {
    throw new Error('useAssetFlow must be used within an AssetFlowProvider');
  }
  return context;
};
