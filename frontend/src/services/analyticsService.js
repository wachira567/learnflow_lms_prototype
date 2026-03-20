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
};

export default analyticsService;
