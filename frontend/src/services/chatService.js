import { api } from "./api";

export const chatService = {
  // Get available chat partners (admins for learners, learners for admins)
  getPartners: async () => {
    return await api.get("/chat-partners");
  },

  // Get all conversation summaries for current user
  getConversations: async () => {
    return await api.get("/chats");
  },

  // Get full message history with a specific partner
  getMessages: async (partnerId) => {
    return await api.get(`/chats/${partnerId}`);
  },

  // Send a direct message to a partner
  sendMessage: async (partnerId, content) => {
    return await api.post(`/chats/${partnerId}`, { content });
  },

  // Mark all messages from a partner as read
  markRead: async (partnerId) => {
    return await api.put(`/chats/${partnerId}/read`);
  },
};

export default chatService;
