import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import apiService from '../lib/api-service';

/**
 * Custom hook to manage branch-related functionality
 * @returns {Object} Branch state and actions
 */
export const useBranches = () => {
  const { user, isAdmin } = useAuth();
  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load branches when user is available
  useEffect(() => {
    if (user && user.id) {
      fetchBranches();
    }
  }, [user]);

  // Fetch branches for current user
  const fetchBranches = async () => {
    try {
      setLoading(true);
      console.log('Fetching branches...');
      
      // First check if user exists and has an ID
      if (!user || !user.id) {
        console.warn('Cannot fetch branches, user not fully loaded');
        return;
      }
      
      const response = await apiService.branches.getUserBranches(user.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Error fetching branches');
      }
      
      const data = response.data;
      console.log('Branches fetched:', data?.length || 0);
      
      if (!data || data.length === 0) {
        // User doesn't have any branches, create a default one
        if (isAdmin) {
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
      setError(error.message || 'Error loading branches data');
      toast.error('Error loading branches data');
    } finally {
      setLoading(false);
    }
  };

  // Create a default branch for a new admin user
  const createDefaultBranch = async (branchName = 'Main Branch') => {
    try {
      setLoading(true);
      console.log('Creating default branch...');
      
      const branchData = {
        name: branchName,
        clinic_id: user.clinic_id || null, // If user has clinic_id
        is_active: true,
        created_by: user.id
      };
      
      const response = await apiService.branches.createBranch(branchData, user.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Error creating default branch');
      }
      
      const newBranch = response.data;
      setBranches([newBranch]);
      setActiveBranch(newBranch);
      console.log('Default branch created', newBranch);
      
    } catch (error) {
      console.error('Error creating default branch:', error);
      setError(error.message || 'Error creating branch');
      toast.error('Error creating default branch');
    } finally {
      setLoading(false);
    }
  };

  // Switch active branch
  const switchBranch = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setActiveBranch(branch);
      return true;
    }
    return false;
  };

  return {
    // State
    branches,
    activeBranch,
    loading,
    error,
    
    // Actions
    fetchBranches,
    createDefaultBranch,
    switchBranch,
    setActiveBranch,
    
    // Derived state
    hasBranches: branches.length > 0,
    branchesLoading: loading
  };
}; 