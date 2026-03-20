import { api } from "./api";

// Learner service for learner dashboard and MyLearning page
export const learnerService = {
  // Get learner dashboard stats
  getStats: async () => {
    const response = await api.get("/learner/stats");
    return response;
  },

  // Get learner's enrolled courses with progress
  getEnrollments: async () => {
    const response = await api.get("/learner/enrollments");
    return response;
  },
};

export default learnerService;
