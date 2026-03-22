import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  User,
  ShieldCheck,
  ArrowRight,
  Video,
  MessageCircle,
  Search,
  Send,
  X
} from "lucide-react";
import { learnerService } from "../../services/learnerService";
import { chatService } from "../../services/chatService";
import { formatDistanceToNow } from "date-fns";

const MyMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inquiries"); // "inquiries" or "chat"
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMessages();
    fetchConversations();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await learnerService.getMyMessages();
      setMessages(data);
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
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Group messages by thread (parent_id)
  const threads = messages.filter(m => !m.parent_id).map(parent => ({
    ...parent,
    replies: messages.filter(reply => reply.parent_id === parent.id)
  }));

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Messages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your course inquiries and communicate with instructors.
        </p>
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
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-500 dark:text-slate-400">
                <Mail className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No course inquiries yet</p>
                <p className="text-sm">Your private questions to instructors will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {threads.map((thread) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6"
                  >
                    {/* Parent Message */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                              You
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-medium">
                              {thread.course_title}
                            </span>
                            {thread.lesson_title && (
                              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full font-medium flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {thread.lesson_title}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">
                          {thread.content}
                        </p>
                      </div>
                    </div>

                    {/* Replies */}
                    {thread.replies.length > 0 ? (
                      <div className="ml-14 space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                        {thread.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0">
                              <ShieldCheck className="w-5 h-5 text-success-600" />
                            </div>
                            <div className="flex-1 p-4 bg-success-50/50 dark:bg-success-900/10 rounded-2xl border border-success-100 dark:border-success-900/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-success-700 dark:text-success-400 uppercase tracking-wider">
                                  Instructor Response
                                </span>
                                <span className="text-[10px] text-success-600/60 font-medium">
                                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-14 mt-2">
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Awaiting instructor response...
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
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
                    <p className="text-sm">Start a conversation with an instructor</p>
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMessages;
