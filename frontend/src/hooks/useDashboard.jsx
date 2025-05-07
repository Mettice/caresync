import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from './useAuth';
import apiService from '../lib/api-service';

/**
 * Custom hook to manage dashboard state and data fetching
 * @returns {Object} Dashboard state and actions
 */
export const useDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalStaff: 0,
    appointments: 0,
    newPatients: 0,
    reminders: 0,
    documents: 0
  });

  // Initialize dashboard when auth state changes
  useEffect(() => {
    if (!authLoading) {
      initDashboard();
    }
  }, [authLoading, user]);

  // Dashboard initialization logic
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

  // Fetch dashboard statistics
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

  // Retry loading dashboard
  const retryLoading = () => {
    initDashboard();
  };

  return {
    // State
    user,
    profile,
    loading: loading || authLoading,
    error,
    stats,
    isAdmin,
    
    // Actions
    fetchStats,
    retryLoading,
    
    // Derived state
    hasError: !!error,
    isInitialized: !loading && !error && !!user
  };
}; 