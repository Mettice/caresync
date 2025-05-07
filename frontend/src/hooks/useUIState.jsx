import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook to manage UI state like active tabs, sidebar visibility, etc.
 * @param {Object} options - Configuration options
 * @param {string} options.defaultTab - Default selected tab
 * @returns {Object} UI state and actions
 */
export const useUIState = ({ defaultTab = 'overview' } = {}) => {
  const { isAdmin } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Sidebar visibility (for mobile)
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Other UI states
  const [showBranches, setShowBranches] = useState(false);
  
  // Define available tabs with their properties
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      id: 'patients', 
      label: 'Patients',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 'staff', 
      label: 'Staff', 
      adminOnly: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: 'documents', 
      label: 'Documents',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'reminders', 
      label: 'Reminders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'emailSettings', 
      label: 'Email Settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Filter tabs based on user role
  const availableTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  // Toggle mobile sidebar
  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(prev => !prev);
  }, []);

  // Toggle branches dropdown
  const toggleBranchesDropdown = useCallback(() => {
    setShowBranches(prev => !prev);
  }, []);

  // Change the active tab
  const changeTab = useCallback((tabId) => {
    // Close mobile sidebar if it's open
    if (isMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
    setActiveTab(tabId);
  }, [isMobileSidebarOpen]);

  return {
    // State
    activeTab,
    tabs,
    availableTabs,
    isMobileSidebarOpen,
    showBranches,
    
    // Actions
    setActiveTab: changeTab,
    toggleMobileSidebar,
    closeMobileSidebar: () => setMobileSidebarOpen(false),
    openMobileSidebar: () => setMobileSidebarOpen(true),
    toggleBranchesDropdown,
    setShowBranches
  };
}; 