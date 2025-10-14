import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SessionTimeoutModal from '../components/SessionTimeoutModal';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const WARNING_DURATION = 2 * 60 * 1000; // 2 minutes

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isIdleWarningVisible, setIsIdleWarningVisible] = useState(false);
  const [idleSecondsRemaining, setIdleSecondsRemaining] = useState(null);

  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const clearInactivityTimers = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/verify');
          if (response.data.valid) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!token || !user) {
      clearInactivityTimers();
      setIsIdleWarningVisible(false);
      setIdleSecondsRemaining(null);
      return;
    }

    startInactivityTimers();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, handleUserActivity));
    window.addEventListener('focus', handleUserActivity);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleUserActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleUserActivity));
      window.removeEventListener('focus', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInactivityTimers();
    };
  }, [token, user, handleUserActivity, startInactivityTimers, clearInactivityTimers]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Set token in localStorage first
      localStorage.setItem('token', newToken);
      
      // Update axios headers BEFORE setting state
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Small delay to ensure headers are set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then update state
      setToken(newToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const handleAutoLogout = useCallback(() => {
    setIsIdleWarningVisible(false);
    setIdleSecondsRemaining(null);
    logout({ reason: 'idle' });
  }, [logout]);

  const startInactivityTimers = useCallback(() => {
    if (!token || !user) {
      clearInactivityTimers();
      setIsIdleWarningVisible(false);
      setIdleSecondsRemaining(null);
      return;
    }

    clearInactivityTimers();

    warningTimeoutRef.current = setTimeout(() => {
      setIdleSecondsRemaining(Math.floor(WARNING_DURATION / 1000));
      setIsIdleWarningVisible(true);

      countdownIntervalRef.current = setInterval(() => {
        setIdleSecondsRemaining(prev => {
          const next = typeof prev === 'number' ? prev - 1 : Math.floor(WARNING_DURATION / 1000) - 1;
          if (next <= 0) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            return 0;
          }
          return next;
        });
      }, 1000);
    }, Math.max(INACTIVITY_TIMEOUT - WARNING_DURATION, 0));

    logoutTimeoutRef.current = setTimeout(() => {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      handleAutoLogout();
    }, INACTIVITY_TIMEOUT);
  }, [token, user, clearInactivityTimers, handleAutoLogout]);

  const handleUserActivity = useCallback(() => {
    if (!token || !user) {
      return;
    }
    setIsIdleWarningVisible(false);
    setIdleSecondsRemaining(null);
    startInactivityTimers();
  }, [token, user, startInactivityTimers]);

  const handleStayLoggedIn = useCallback(async () => {
    try {
      await axios.get('/api/auth/verify');
    } catch (error) {
      logout({ reason: 'idle' });
      return;
    }
    setIsIdleWarningVisible(false);
    setIdleSecondsRemaining(null);
    startInactivityTimers();
  }, [logout, startInactivityTimers]);

  // Register function (email + password only)
  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { firstName, lastName, email, password });
      const { token: newToken, user: newUser } = response.data;
      
      // Set token in localStorage first
      localStorage.setItem('token', newToken);
      
      // Update axios headers BEFORE setting state
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Small delay to ensure headers are set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then update state
      setToken(newToken);
      setUser(newUser);
      
      toast.success('Registration successful! Welcome to Palm Run LLC.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = useCallback(async ({ silent = false, reason } = {}) => {
    clearInactivityTimers();
    try {
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];

      if (!silent) {
        if (reason === 'idle') {
          toast.error('You were signed out after 20 minutes of inactivity.');
        } else {
          toast.success('Logged out successfully');
        }
      }
    }
  }, [token, clearInactivityTimers]);

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('User refresh error:', error);
      return { success: false, error: 'Failed to refresh user data' };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { 
        success: true, 
        message: response.data.message,
        resetUrl: response.data.resetUrl,
        resetToken: response.data.resetToken
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset email. Please try again.';
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post('/api/auth/reset-password', { token, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to reset password. Please try again.';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isIdleWarningVisible && (
        <SessionTimeoutModal
          secondsRemaining={Math.max(idleSecondsRemaining ?? Math.floor(WARNING_DURATION / 1000), 0)}
          onStay={handleStayLoggedIn}
          onLogout={() => logout()}
        />
      )}
    </AuthContext.Provider>
  );
};
