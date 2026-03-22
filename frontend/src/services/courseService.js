import { api } from "./api";

// Course service for course-related API calls
export const courseService = {
  // Get all courses
  getAllCourses: async (filters = {}) => {
    let endpoint = "/courses";
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.level) params.append("level", filters.level);
    if (filters.search) params.append("search", filters.search);
    if (filters.skip) params.append("skip", filters.skip);
    if (filters.limit) params.append("limit", filters.limit);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await api.get(endpoint);
  },

  // Get single course by ID
  getCourseById: async (id) => {
    return await api.get(`/courses/${id}`);
  },

  // Create new course (admin only)
  createCourse: async (courseData) => {
    return await api.post("/courses", courseData);
  },

  // Update course (admin only)
  updateCourse: async (id, courseData) => {
    return await api.put(`/courses/${id}`, courseData);
  },

  // Delete course (admin only)
  deleteCourse: async (id) => {
    return await api.delete(`/courses/${id}`);
  },

  // Add lesson to course (admin only)
  addLesson: async (courseId, lessonData) => {
    return await api.post(`/courses/${courseId}/lessons`, lessonData);
  },

  // Get course lessons
  getCourseLessons: async (courseId) => {
    return await api.get(`/courses/${courseId}/lessons`);
  },

  // Get user progress for a course
  getProgress: async (courseId) => {
    return await api.get(`/courses/${courseId}/progress`);
  },

  // Update lesson progress (mark as complete)
  updateProgress: async (courseId, lessonId, completed) => {
    return await api.post(`/courses/${courseId}/progress`, {
      lesson_id: lessonId,
      completed,
    });
  },

  // Get all categories
  getCategories: async () => {
    return await api.get("/categories");
  },

  // Enroll in a course
  enrollCourse: async (courseId) => {
    return await api.post(`/courses/${courseId}/enroll`);
  },

  // Unenroll from a course
  unenrollCourse: async (courseId) => {
    return await api.delete(`/courses/${courseId}/unenroll`);
  },

  // Get user's all progress
  getMyProgress: async () => {
    return await api.get("/my-progress");
  },

  // Get all users (admin only)
  getAllUsers: async (filters = {}) => {
    let endpoint = "/users";
    const params = new URLSearchParams();

    if (filters.role) params.append("role", filters.role);
    if (filters.skip) params.append("skip", filters.skip);
    if (filters.limit) params.append("limit", filters.limit);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await api.get(endpoint);
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    return await api.get(`/users/${userId}`);
  },

  // Upload course thumbnail
  uploadThumbnail: async (file) => {
    return await api.upload("/upload", file);
  },

  // Get admin messages (inquiries from learners)
  getAdminMessages: async () => {
    return await api.get("/admin/messages");
  },

  // Reply to a message
  replyToMessage: async (messageId, content) => {
    return await api.post(`/discussions/${messageId}/reply`, { content });
  },
};

export default courseService;
