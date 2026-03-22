import { api } from "./api";

// Analytics service for admin dashboard
export const analyticsService = {
  // Get overall statistics
  getStats: async () => {
    const response = await api.get("/analytics/stats");
    return response;
  },

  // Get category distribution
  getCategoryDistribution: async () => {
    const response = await api.get("/analytics/categories");
    return response;
  },

  // Get enrollment trends over time
  getEnrollmentTrends: async (days = 30) => {
    const response = await api.get(`/analytics/enrollment-trends?days=${days}`);
    return response;
  },

  // Get user growth over time
  getUserGrowth: async (months = 6) => {
    const response = await api.get(`/analytics/user-growth?months=${months}`);
    return response;
  },

  // Get platform insights
  getInsights: async () => {
    const response = await api.get("/analytics/insights");
    return response;
  },

  // Get courses with enrollment counts (for admin dashboard)
  getCoursesWithEnrollments: async () => {
    const response = await api.get("/courses/with-enrollments");
    return response;
  },

  // ============ REPORT ENDPOINTS ============

  // Get course report with filters
  getCourseReport: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.level) params.append("level", filters.level);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    
    if (filters.limit) params.append("limit", filters.limit);
    const response = await api.get(`/reports/courses?${params.toString()}`);
    return response;
  },

  // Get student report with filters
  getStudentReport: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.course_id) params.append("course_id", filters.course_id);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.status) params.append("status", filters.status);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await api.get(`/reports/students?${params.toString()}`);
    return response;
  },

  // Get user report with filters
  getUserReport: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await api.get(`/reports/users?${params.toString()}`);
    return response;
  },

  // Get activity report with date filters
  getActivityReport: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await api.get(`/reports/activity?${params.toString()}`);
    return response;
  },
};

export default analyticsService;
