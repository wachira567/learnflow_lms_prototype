import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  User, 
  Clock, 
  ChevronRight, 
  Search,
  Send,
  X,
  CheckCircle,
  Video,
  MessageCircle,
  Plus,
  UserPlus
} from "lucide-react";
import { courseService } from "../../services/courseService";
import { chatService } from "../../services/chatService";
import { api } from "../../services/api";
import { formatDistanceToNow } from "date-fns";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("inquiries"); // "inquiries" or "chat"
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  
  // New message modal states
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newChatUser, setNewChatUser] = useState(null);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [isSendingNewChat, setIsSendingNewChat] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchConversations();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await courseService.getAdminMessages();
      // Only show top-level messages (those without parent_id)
      const topLevel = data.filter(m => !m.parent_id);
      setMessages(topLevel);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const data = await chatService.getMessages(conv.partner_id);
      setChatMessages(data);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSendingChat(true);
    try {
      await chatService.sendMessage(selectedConversation.partner_id, newMessage);
      setNewMessage("");
      // Refresh messages
      const data = await chatService.getMessages(selectedConversation.partner_id);
      setChatMessages(data);
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Failed to send message", "error");
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedMessage) return;

    setIsSending(true);
    try {
      await courseService.replyToMessage(selectedMessage.id, replyContent);
      setReplyContent("");
      setSelectedMessage(null);
      showNotification("Reply sent successfully!");
      fetchMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      showNotification("Failed to send reply", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Search for users to start new conversation
  const handleSearchUsers = async (query) => {
    setUserSearchQuery(query);
    if (query.length < 2) {
      setSearchedUsers([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const users = await courseService.getAllUsers();
      const filtered = users.filter(u => 
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(query.toLowerCase())
      );
      setSearchedUsers(filtered.slice(0, 5));
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartNewConversation = async (user) => {
    setNewChatUser(user);
  };

  const handleSendNewChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !newChatUser) return;

    setIsSendingNewChat(true);
    try {
      await chatService.sendMessage(newChatUser.id, newChatMessage);
      showNotification("Message sent successfully!");
      setShowNewMessageModal(false);
      setNewChatUser(null);
      setNewChatMessage("");
      setUserSearchQuery("");
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification(error.response?.data?.detail || "Failed to send message", "error");
    } finally {
      setIsSendingNewChat(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredMessages = messages.filter(m => 
    m.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.lesson_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-8">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
              notification.type === "success"
                ? "bg-success-500 text-white"
                : "bg-danger-500 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Message Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Communicate directly with your learners and answer lesson queries.
          </p>
        </div>
        <button
          onClick={() => setShowNewMessageModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Message</span>
        </button>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setActiveTab("inquiries");
            setSelectedConversation(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "inquiries"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <MessageCircle className="w-4 h-4 inline-block mr-2" />
          Course Inquiries
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "chat"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <MessageSquare className="w-4 h-4 inline-block mr-2" />
          Direct Messages
          {conversations.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {conversations.length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col">
        {activeTab === "inquiries" ? (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student, course, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Course Inquiries List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                  <Mail className="w-12 h-12 mb-4 opacity-20" />
                  <p>No course inquiries found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {msg.author_avatar ? (
                            <img src={msg.author_avatar} alt={msg.author_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                              {msg.author_name}
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                              {msg.course_title}
                            </span>
                            {msg.lesson_title && (
                              <span className="text-xs font-medium px-2 py-0.5 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-300 rounded-full flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {msg.lesson_title}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                            "{msg.content}"
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors self-center" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // Direct Messages Tab
          <div className="flex flex-col lg:flex-row h-full">
            {/* Conversations List */}
            <div className={`${selectedConversation ? 'lg:w-1/3' : 'w-full'} border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>
              <div className="overflow-y-auto h-[500px]">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p>No conversations yet</p>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="mt-2 text-primary-600 hover:underline text-sm"
                    >
                      Start a new conversation
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {conversations
                      .filter(c => !searchQuery || (c.partner_name && c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())))
                      .map((conv) => (
                      <motion.div
                        key={conv.partner_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                          selectedConversation?.partner_id === conv.partner_id
                            ? "bg-primary-50 dark:bg-primary-900/30"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {conv.partner_name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                                {conv.partner_name || "Unknown User"}
                              </h4>
                              {conv.last_message_time && (
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                  {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {conv.last_message || "No messages yet"}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 mt-1">
                                {conv.unread_count} new
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col lg:max-h-[600px]">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                      {selectedConversation.partner_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {selectedConversation.partner_name || "Unknown User"}
                      </h3>
                      <p className="text-xs text-slate-500">Direct message</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isOwn = msg.sender_id === currentUser.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-primary-600 text-white rounded-br-sm"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? "text-primary-200" : "text-slate-400"}`}>
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat || !newMessage.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="hidden lg:flex flex-1 items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Select a conversation to start chatting</p>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="mt-2 text-primary-600 hover:underline text-sm"
                  >
                    Or start a new conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  New Message
                </h3>
                <button
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setNewChatUser(null);
                    setUserSearchQuery("");
                    setSearchedUsers([]);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {!newChatUser ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Search for a learner
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearchQuery}
                        onChange={(e) => handleSearchUsers(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {isSearching && (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  )}

                  {searchedUsers.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchedUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleStartNewConversation(user)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {userSearchQuery.length >= 2 && !isSearching && searchedUsers.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No users found</p>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                        {newChatUser.first_name?.[0]}{newChatUser.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {newChatUser.first_name} {newChatUser.last_name}
                        </p>
                        <p className="text-sm text-slate-500">{newChatUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNewChatUser(null)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSendNewChatMessage}>
                    <textarea
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Write your message..."
                      className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewMessageModal(false);
                          setNewChatUser(null);
                          setUserSearchQuery("");
                        }}
                        className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingNewChat || !newChatMessage.trim()}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {isSendingNewChat ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal for Course Inquiries */}
      <AnimatePresence>
        {selectedMessage && activeTab === "inquiries" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Respond to Message
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Message context */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                      Question from {selectedMessage.author_name}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{selectedMessage.content}"
                  </p>
                </div>

                <form onSubmit={handleSendReply} className="space-y-4">
                  <textarea
                    autoFocus
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your response here..."
                    className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                  />
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(null)}
                      className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSending || !replyContent.trim()}
                      className="flex items-center justify-center space-x-2 px-8 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                    >
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMessages;
