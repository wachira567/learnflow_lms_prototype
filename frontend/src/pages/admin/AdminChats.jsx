import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../contexts/AuthContext";
import { formatDistanceToNow, format, isToday } from "date-fns";

const AdminChats = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [learners, setLearners] = useState([]);
  const [learnerSearch, setLearnerSearch] = useState("");

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  // Poll conversations every 8 seconds
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll messages every 5 seconds when a conversation is open
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (selectedPartner) {
      fetchMessages(selectedPartner.partner_id);
      pollRef.current = setInterval(
        () => fetchMessages(selectedPartner.partner_id, false),
        5000
      );
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedPartner?.partner_id]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoadingConvos(false);
    }
  };

  const fetchMessages = async (partnerId, showLoading = true) => {
    if (showLoading) setIsLoadingMessages(true);
    try {
      const data = await chatService.getMessages(partnerId);
      setMessages(data);
      await chatService.markRead(partnerId);
      setConversations((prev) =>
        prev.map((c) =>
          c.partner_id === partnerId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  const handleSelectPartner = (convo) => {
    setSelectedPartner(convo);
    setMessages([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "48px";
    }

    try {
      const msg = await chatService.sendMessage(
        selectedPartner.partner_id,
        content
      );
      setMessages((prev) => [...prev, msg]);
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleNewChat = async () => {
    setShowNewChat(true);
    try {
      const data = await chatService.getPartners();
      setLearners(data);
    } catch (err) {
      console.error("Error fetching learners:", err);
    }
  };

  const handleStartConversation = (learner) => {
    const existing = conversations.find((c) => c.partner_id === learner.id);
    if (existing) {
      setSelectedPartner(existing);
    } else {
      setSelectedPartner({
        partner_id: learner.id,
        partner_name: learner.name,
        partner_avatar: learner.avatar,
        partner_role: learner.role,
        last_message: "",
        unread_count: 0,
      });
    }
    setShowNewChat(false);
    setLearnerSearch("");
  };

  const formatMsgTime = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    return format(date, "MMM d, HH:mm");
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread_count, 0);

  const filteredConversations = conversations.filter((c) =>
    c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLearners = learners.filter((l) =>
    l.name.toLowerCase().includes(learnerSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Page header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Chats
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Direct messages with your learners
        </p>
      </div>

      {/* Main chat container */}
      <div className="flex flex-1 overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* ── Left panel: conversation list ── */}
        <div
          className={`flex flex-col border-r border-slate-200 dark:border-slate-700 w-80 flex-shrink-0 ${
            selectedPartner ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Panel header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Conversations
                {totalUnread > 0 && (
                  <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {totalUnread}
                  </span>
                )}
              </span>
              <button
                onClick={handleNewChat}
                className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConvos ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 p-6 text-center">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1">
                  Start a new chat by clicking +
                </p>
              </div>
            ) : (
              filteredConversations.map((convo) => (
                <button
                  key={convo.partner_id}
                  onClick={() => handleSelectPartner(convo)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left ${
                    selectedPartner?.partner_id === convo.partner_id
                      ? "bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                      {convo.partner_avatar ? (
                        <img
                          src={convo.partner_avatar}
                          alt={convo.partner_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-sm truncate ${
                          convo.unread_count > 0
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-medium text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {convo.partner_name}
                      </span>
                      <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
                        {convo.last_message_at
                          ? formatDistanceToNow(
                              new Date(convo.last_message_at),
                              { addSuffix: false }
                            )
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs truncate ${
                          convo.unread_count > 0
                            ? "text-slate-900 dark:text-white font-medium"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {convo.last_message || "No messages yet"}
                      </p>
                      {convo.unread_count > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {convo.unread_count > 9 ? "9+" : convo.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Right panel: chat window ── */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            !selectedPartner ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedPartner ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 opacity-40" />
              </div>
              <p className="font-medium text-slate-600 dark:text-slate-300">
                Select a conversation
              </p>
              <p className="text-sm mt-1">
                or start a new chat with a learner
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedPartner.partner_avatar ? (
                    <img
                      src={selectedPartner.partner_avatar}
                      alt={selectedPartner.partner_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {selectedPartner.partner_name}
                  </h3>
                  <span className="text-xs text-slate-400 capitalize">
                    {selectedPartner.partner_role}
                  </span>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        } items-end gap-2`}
                      >
                        {!isOwn && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {msg.sender_avatar ? (
                              <img
                                src={msg.sender_avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md xl:max-w-lg flex flex-col ${
                            isOwn ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? "bg-primary-600 text-white rounded-br-sm"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">
                            {formatMsgTime(msg.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none text-sm"
                    rows={1}
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-sm"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  New Chat
                </h3>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setLearnerSearch("");
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search learners..."
                    value={learnerSearch}
                    onChange={(e) => setLearnerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {filteredLearners.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-8">
                      No learners found
                    </p>
                  ) : (
                    filteredLearners.map((learner) => (
                      <button
                        key={learner.id}
                        onClick={() => handleStartConversation(learner)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {learner.avatar ? (
                            <img
                              src={learner.avatar}
                              alt={learner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {learner.name}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">
                            {learner.role}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminChats;
