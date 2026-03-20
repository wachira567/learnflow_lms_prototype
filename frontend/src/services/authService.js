import { api } from "./api";

// Auth service for authentication-related API calls
export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { access_token } = response;

    // Store token in localStorage BEFORE calling getCurrentUser
    localStorage.setItem("learnflow-token", access_token);

    // Get user info using the token
    const userResponse = await api.get("/auth/me");

    return {
      token: access_token,
      user: userResponse,
    };
  },

  // Register new user
  register: async (userData) => {
    const { email, password, firstName, lastName, role } = userData;
    const response = await api.post("/auth/register", {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role: role || "learner",
    });

    const { access_token } = response;

    // Store token in localStorage BEFORE calling getCurrentUser
    localStorage.setItem("learnflow-token", access_token);

    // Get user info using the token
    const userResponse = await api.get("/auth/me");

    return {
      token: access_token,
      user: userResponse,
    };
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put("/auth/profile", profileData);
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    return { message: "Password reset functionality not implemented in API" };
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    return { message: "Password reset functionality not implemented in API" };
  },
};

export default authService;
