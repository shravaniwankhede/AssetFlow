import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AssetFlowProvider, useAssetFlow } from './contexts/AssetFlowContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Layout components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import OrganizationSetup from './pages/OrganizationSetup/OrganizationSetup';
import AssetRegistration from './pages/AssetRegistration';
import AssetAllocation from './pages/AssetAllocation/AssetAllocation';
import ResourceBooking from './pages/ResourceBooking/ResourceBooking';
import Maintenance from './pages/Maintenance/Maintenance';
import Audit from './pages/Audit/Audit';
import Reports from './pages/Reports/Reports';
import Notifications from './pages/Notifications/Notifications';

// Chatbot Copilot
import { ChatProvider } from './contexts/ChatContext';
import Chatbot from './components/Chatbot/Chatbot';

// CSS Layout
import './App.css';

// Protected Route Guard Component
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser } = useAssetFlow();

  if (!currentUser) {
    // Redirect to Login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if role is authorized for this route
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Route-level Transition Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

// Main Layout Wrapper
const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="app-layout-container">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        toggleMobileSidebar={toggleMobileSidebar} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={`app-content-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar toggleMobileSidebar={toggleMobileSidebar} />
        <main className="app-main-content">
          <AnimatedRoutes />
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

function App() {
  return (
    <AssetFlowProvider>
      <BrowserRouter>
        <ChatProvider>
          {/* React Hot Toast notification container */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#111827',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#22C55E',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes inside AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assets" element={<AssetRegistration />} />
                <Route path="/allocation" element={<AssetAllocation />} />
                <Route path="/resources" element={<ResourceBooking />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Role-restricted Routes: Admin, Asset Manager, Department Head, and Employee */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']} />}>
              <Route element={<AppLayout />}>
                <Route path="/organization" element={<OrganizationSetup />} />
              </Route>
            </Route>

            {/* Role-restricted Routes: Admin, Asset Manager, Department Head, and Employee */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Asset Manager', 'Department Head', 'Employee']} />}>
              <Route element={<AppLayout />}>
                <Route path="/audit" element={<Audit />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ChatProvider>
      </BrowserRouter>
    </AssetFlowProvider>
  );
}

export default App;
