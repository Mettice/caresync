import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import IntakeFormReview from './IntakeFormReview';
import EmailSettings from '../pages/EmailSettings';
import DocumentList from './DocumentList';
import ReminderForm from './ReminderForm';
import AddPatient from './AddPatient';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import StaffManagement from './StaffManagement';

// Enhanced Dashboard Component
const Dashboard = ({ apiService }) => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAdmin, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalStaff: 0,
    appointments: 0,
    newPatients: 0,
    reminders: 0,
    documents: 0
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showBranches, setShowBranches] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      initDashboard();
    }
  }, [authLoading, user]);

  const initDashboard = async () => {
    try {
      setLoading(true);
      console.log('Initializing dashboard...');
      
      // Check if we have an authenticated user
      if (!user) {
        console.warn('No active session found');
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      console.log('Session exists, user ID:', user.id);
      
      // Verify apiService is available
      if (!apiService) {
        console.error('API service not available');
        setError('API service not available. Please refresh the page.');
        return;
      }
      
      // Fetch stats with proper error handling
      await fetchStats();
      
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      setError('Failed to initialize dashboard. Please refresh or log in again.');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log("Fetching dashboard stats...");
      
      const response = await apiService.dashboard.getStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error('Error fetching dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error fetching dashboard statistics');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const fetchBranches = async () => {
    try {
      console.log('Fetching branches...');
      
      // First check if user exists and has an ID
      if (!user || !user.id) {
        console.warn('Cannot fetch branches, user not fully loaded');
        return;
      }
      
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          user_branches!inner(user_id)
        `)
        .eq('user_branches.user_id', user.id);

      if (error) {
        console.error('Error fetching branches:', error);
        toast.error('Failed to load branches');
        return;
      }

      console.log('Branches fetched:', data?.length || 0);
      
      if (!data || data.length === 0) {
        // User doesn't have any branches, create a default one
        if (user.role === 'admin') {
          console.log('No branches found, creating default branch for admin');
          await createDefaultBranch();
        } else {
          console.log('No branches for non-admin user');
          setBranches([]);
        }
      } else {
        setBranches(data);
        setActiveBranch(data[0]);
      }
      
    } catch (error) {
      console.error('Error in fetchBranches:', error);
      toast.error('Error loading branches data');
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we load your data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={initDashboard}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-indigo-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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

  // Filter tabs based on user role (using isAdmin from useAuth)
  const availableTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 3.5L18 2L16.5 3.5L15 2L13.5 3.5L12 2L10.5 3.5L9 2L7.5 3.5L6 2V22L4.5 20.5L6 22L7.5 20.5L9 22L10.5 20.5L12 22L13.5 20.5L15 22L16.5 20.5L18 22L19.5 20.5L21 22V2L19.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 6H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 14H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-indigo-600">CareSync</span>
                </Link>
              </div>
              <button
                type="button"
                className="ml-4 md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>

                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {profile.first_name?.charAt(0) || ''}{profile.last_name?.charAt(0) || ''}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {profile.first_name} {profile.last_name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Log Out
                </button>
              </div>
              
              <Link 
                to="/"
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 hidden md:block"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsMobileSidebarOpen(false)}></div>

            <div className="relative flex-1 flex flex-col max-w-xs w-full pb-4 bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2">
                  <div className="space-y-1">
                    {availableTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`
                          group flex items-center px-2 py-2 text-base font-medium rounded-md w-full
                          ${activeTab === tab.id
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <span className={`mr-4 h-6 w-6 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {tab.icon}
                        </span>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </nav>
              </div>

              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {profile.first_name?.charAt(0) || ''}{profile.last_name?.charAt(0) || ''}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{profile.first_name} {profile.last_name}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize">{profile.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto flex-shrink-0 bg-white p-1 text-gray-400 rounded-full hover:text-gray-500"
                >
                  <span className="sr-only">Log out</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                  {availableTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full
                        ${activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <span className={`mr-3 h-6 w-6 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {tab.icon}
                      </span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Content area */}
                {activeTab === 'overview' && (
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                    
                    {/* Today's Summary Card */}
                    <div className="mt-6 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-white">Today's Summary</h2>
                        <p className="mt-1 text-indigo-100">Welcome back, {profile.first_name}! Here's what's happening today.</p>
                        
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-white bg-opacity-30 text-white">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-white">Appointments</h3>
                                <p className="mt-1 text-4xl font-bold text-white">{stats.appointments}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                            <div className="flex items-center">
                              <div className="p-3 rounded-full bg-white bg-opacity-30 text-white">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-white">New Patients</h3>
                                <p className="mt-1 text-4xl font-bold text-white">{stats.newPatients}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                      {/* Patients Card */}
                      <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                                <dd>
                                  <div className="text-lg font-medium text-gray-900">{stats.totalPatients}</div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                          <div className="text-sm">
                            <button
                              onClick={() => setActiveTab('patients')}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              View all patients
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Staff Card */}
                      <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Staff</dt>
                                <dd>
                                  <div className="text-lg font-medium text-gray-900">{stats.totalStaff}</div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                          <div className="text-sm">
                            {isAdmin ? (
                              <button
                                onClick={() => setActiveTab('staff')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                Manage staff
                                <span aria-hidden="true"> &rarr;</span>
                              </button>
                            ) : (
                              <span className="text-gray-500">Staff management (admin only)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Documents Card */}
                      <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Documents</dt>
                                <dd>
                                  <div className="text-lg font-medium text-gray-900">{stats.documents}</div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                          <div className="text-sm">
                            <button
                              onClick={() => setActiveTab('documents')}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              View all documents
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                      <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <button
                          onClick={() => setActiveTab('patients')}
                          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span className="mt-2 block text-sm font-medium text-gray-900">Add Patient</span>
                        </button>
                        
                        <button
                          onClick={() => setActiveTab('documents')}
                          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="mt-2 block text-sm font-medium text-gray-900">Upload Document</span>
                        </button>
                        
                        <button
                          onClick={() => setActiveTab('reminders')}
                          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="mt-2 block text-sm font-medium text-gray-900">Set Reminder</span>
                        </button>
                        
                        <button
                          onClick={() => setActiveTab('emailSettings')}
                          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span className="mt-2 block text-sm font-medium text-gray-900">Email Settings</span>
                        </button>
                      </div>
                    </div>

                    {/* User Profile Card */}
                    <div className="mt-8 bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Your Profile</h3>
                        <div className="mt-5 border-t border-gray-200">
                          <dl className="divide-y divide-gray-200">
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Full name</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.first_name} {profile.last_name}</dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Email address</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email}</dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">Role</dt>
                              <dd className="mt-1 text-sm text-gray-900 capitalize sm:mt-0 sm:col-span-2">{profile.role}</dd>
                            </div>
                            {profile.specialization && (
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.specialization}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'patients' && (
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Patient Management</h1>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="p-6">
                        <AddPatient />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'staff' && isAdmin && (
                  <div>
                    <StaffManagement branchId="1" apiService={apiService} /> {/* Note: Using hardcoded branchId for demo, replace with actual branchId from context/state */}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Document Management</h1>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="p-6">
                        <DocumentList />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reminders' && (
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reminder Management</h1>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="p-6">
                        <ReminderForm />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'emailSettings' && (
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Email Settings</h1>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="p-6">
                        <EmailSettings />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Help Center</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Privacy Policy</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Terms of Service</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">&copy; 2025 CareSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
