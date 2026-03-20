import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("learnflow-token");
        if (token) {
          // Validate token and get user info
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        localStorage.removeItem("learnflow-token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.login(email, password);

      localStorage.setItem("learnflow-token", response.token);
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.register(userData);

      localStorage.setItem("learnflow-token", response.token);
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("learnflow-token");
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || "Profile update failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Check if user is learner
  const isLearner = () => {
    return user?.role === "learner";
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    isLearner,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
