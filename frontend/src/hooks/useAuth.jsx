import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Context for global auth state
 */
const AuthContext = createContext(null);

/**
 * Provider component for auth state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          return;
        }
        
        if (session) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        // Handle token refresh events specially to avoid unnecessary profile fetches
        if (event === 'TOKEN_REFRESHED') {
          if (session) {
            setUser(session.user);
          }
          return; // Don't continue with profile fetch or loading changes
        }
        
        if (session) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Check if it's "no rows" error, indicating profile doesn't exist
        if (error.code === 'PGRST116') {
          // Create default profile
          const { data: authUserData } = await supabase.auth.getUser(userId);
          const email = authUserData?.user?.email || '';
          
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              auth_id: userId,
              email: email,
              first_name: 'New',
              last_name: 'User',
              role: 'user'
            }])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }
          
          setProfile(newProfile);
          setIsAdmin(newProfile.role === 'admin');
          toast.success('Welcome! New profile created.');
        }
      } else {
        setProfile(data);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email/password
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      // Create user profile
      if (data.user) {
        const { first_name, last_name, role } = userData;
        const profileData = {
          auth_id: data.user.id,
          email: email,
          first_name: first_name || 'New',
          last_name: last_name || 'User',
          role: role || 'user'
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert([profileData]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { success: true, data };
    } catch (error) {
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }
      
      toast.success('Signed out successfully');
      return { success: true };
    } catch (error) {
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (!user || !profile) {
        return { success: false, error: 'No user logged in' };
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('auth_id', user.id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update profile');
        return { success: false, error };
      }

      setProfile(data);
      toast.success('Profile updated successfully');
      return { success: true, data };
    } catch (error) {
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Expose auth functions and state
  const contextValue = {
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    console.warn('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 