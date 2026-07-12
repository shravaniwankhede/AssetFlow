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
  const API_URL = 'http://localhost:5000/api';

  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState(() => getLocalData('af_user', null));
  const [usersList, setUsersList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingResources] = useState([
    { id: 'res-1', name: 'Conference room B2', location: 'Building B, Floor 2' },
    { id: 'res-2', name: 'Projector AF-0082', location: 'IT Department' },
    { id: 'res-3', name: 'Company Tesla Model 3', location: 'Garage Gate 2' },
  ]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [audits, setAudits] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch all application data from backend
  const fetchAppData = async (user = currentUser) => {
    if (!user) return;
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      };

      const [
        usersRes,
        deptsRes,
        catsRes,
        assetsRes,
        transfersRes,
        bookingsRes,
        maintenanceRes,
        auditsRes,
        notificationsRes
      ] = await Promise.all([
        fetch(`${API_URL}/users`, { headers }),
        fetch(`${API_URL}/departments`, { headers }),
        fetch(`${API_URL}/categories`, { headers }),
        fetch(`${API_URL}/assets`, { headers }),
        fetch(`${API_URL}/transfers`, { headers }),
        fetch(`${API_URL}/bookings`, { headers }),
        fetch(`${API_URL}/maintenance`, { headers }),
        fetch(`${API_URL}/audits`, { headers }),
        fetch(`${API_URL}/notifications`, { headers })
      ]);

      if (usersRes.ok) setUsersList(await usersRes.json());
      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
      if (assetsRes.ok) setAssets(await assetsRes.json());
      if (transfersRes.ok) setTransfers(await transfersRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (maintenanceRes.ok) setMaintenanceTickets(await maintenanceRes.json());
      if (auditsRes.ok) setAudits(await auditsRes.json());
      if (notificationsRes.ok) setNotifications(await notificationsRes.json());
    } catch (error) {
      console.error('Error fetching application data:', error);
    }
  };

  // Helper for generating auth headers
  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser) {
      headers['x-user-id'] = currentUser.id;
    }
    return headers;
  };

  // Save/Load auth session
  useEffect(() => {
    setLocalData('af_user', currentUser);
    if (currentUser) {
      fetchAppData(currentUser);
    }
  }, [currentUser]);

  // --- ACTIONS & BUSINESS LOGIC ---

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUsersList([]);
    setDepartments([]);
    setCategories([]);
    setAssets([]);
    setTransfers([]);
    setBookings([]);
    setMaintenanceTickets([]);
    setAudits([]);
    setNotifications([]);
  };

  const promoteUser = async (employeeId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/users/${employeeId}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return { success: false, message: data.message || 'Permission denied' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error' };
    }
  };

  const deactivateEmployee = async (employeeId) => {
    try {
      const res = await fetch(`${API_URL}/users/${employeeId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'Inactive' })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return { success: false, message: data.message || 'Permission denied' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error' };
    }
  };

  const addEmployee = async (name, email, role, department) => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, role, department })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server error' };
    }
  };

  // Departments Operations
  const addDepartment = async (name, head, parentDept) => {
    try {
      const res = await fetch(`${API_URL}/departments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, head, parentDept })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateDepartment = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_URL}/departments/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDepartmentStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/departments/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Categories Operations
  const addCategory = async (name, description) => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Asset Registration Operations
  const registerAsset = async (assetData) => {
    try {
      const res = await fetch(`${API_URL}/assets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(assetData)
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return data.asset.id;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateAssetStatus = async (assetId, newStatus, notes = '') => {
    try {
      const res = await fetch(`${API_URL}/assets/${assetId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus, notes })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Asset Allocation Operations
  const allocateAsset = async (assetId, employeeName, notes = '') => {
    try {
      const res = await fetch(`${API_URL}/assets/${assetId}/allocate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ employeeName, notes })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return {
        success: false,
        message: data.message || 'Allocation failed',
        isAllocated: data.isAllocated,
        currentHolder: data.currentHolder
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection error' };
    }
  };

  const deallocateAsset = async (assetId, conditionNotes = '') => {
    try {
      const res = await fetch(`${API_URL}/assets/${assetId}/deallocate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ conditionNotes })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Raise Transfer Request
  const createTransferRequest = async (assetId, toEmployee, reason) => {
    try {
      const res = await fetch(`${API_URL}/transfers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ assetId, toEmployee, reason })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return { success: false, message: data.message || 'Transfer failed' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection error' };
    }
  };

  const approveTransferRequest = async (transferId) => {
    try {
      const res = await fetch(`${API_URL}/transfers/${transferId}/approve`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return { success: false, message: data.message || 'Approval failed' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection error' };
    }
  };

  const rejectTransferRequest = async (transferId) => {
    try {
      const res = await fetch(`${API_URL}/transfers/${transferId}/reject`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- RESOURCE BOOKINGS LOGIC ---
  const createBooking = async (resourceName, title, startTime, endTime, dateStr) => {
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ resourceName, title, startTime, endTime, dateStr })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return { success: false, message: data.message || 'Booking conflict' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection error' };
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- MAINTENANCE TICKETS LOGIC (Kanban Board) ---
  const reportMaintenance = async (assetId, title, notes) => {
    try {
      const res = await fetch(`${API_URL}/maintenance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ assetId, title, notes })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
        return { success: true };
      }
      return { success: false, message: data.message || 'Report failed' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Server connection error' };
    }
  };

  const updateMaintenanceStatus = async (ticketId, newStatus, technician = '') => {
    try {
      const res = await fetch(`${API_URL}/maintenance/${ticketId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus, technician })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- AUDIT LOGIC ---
  const updateAuditItemVerification = async (auditId, assetId, verificationStatus) => {
    try {
      const res = await fetch(`${API_URL}/audits/${auditId}/items/${assetId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ verificationStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closeAudit = async (auditId) => {
    try {
      const res = await fetch(`${API_URL}/audits/${auditId}/close`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- NOTIFICATIONS UTILITY ---
  const addNotification = async (category, message) => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ category, message })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchAppData();
      }
    } catch (e) {
      console.error(e);
    }
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
