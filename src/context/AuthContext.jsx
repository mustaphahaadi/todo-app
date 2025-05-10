import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getCurrentUser();
          setCurrentUser(response.data);
        } catch (err) {
          console.error("Failed to load user:", err);
          authService.logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      await authService.login(username, password);
      const response = await authService.getCurrentUser();
      setCurrentUser(response.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
      return false;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      await authService.register(userData);
      return true;
    } catch (err) {
      setError(err.response?.data || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: authService.isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;