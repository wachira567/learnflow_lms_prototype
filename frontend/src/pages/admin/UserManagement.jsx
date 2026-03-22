import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Users,
  BarChart2,
  Clock,
  CheckCircle,
  FileText,
  X,
  ChevronRight,
  TrendingUp,
  Save,
} from "lucide-react";
import { courseService } from "../../services/courseService";
import { api } from "../../services/api";
import { AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState("learner");
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await courseService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      setIsStatsLoading(true);
      setShowStatsModal(true);
      const data = await api.get(`/admin/students/${userId}/stats`);
      setSelectedUserStats(data);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      alert("Failed to load student statistics.");
      setShowStatsModal(false);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setEditingUser(user);
    setEditingRole(user.role);
    setShowEditModal(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    
    try {
      setIsEditing(true);
      await api.put(`/users/${editingUser.id}/role`, { role: editingRole });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, role: editingRole } : u
      ));
      
      setShowEditModal(false);
      setEditingUser(null);
      showNotification("User role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
      showNotification(error.response?.data?.detail || "Failed to update role", "error");
    } finally {
      setIsEditing(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-primary-100 text-primary-600",
    },
    {
      label: "Learners",
      value: users.filter((u) => u.role === "learner").length,
      icon: UserCheck,
      color: "bg-success-100 text-success-600",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "admin").length,
      icon: Shield,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Active",
      value: users.filter((u) => u.is_active).length,
      icon: UserCheck,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          User Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage users, roles, and permissions.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div
              className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        >
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="admin">Admin</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery || selectedRole
                ? "Try adjusting your search or filters"
                : "No users have registered yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          user.role === "admin"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-sm rounded-full flex items-center w-fit ${
                          user.is_active
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={() => fetchUserStats(user.id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="View Student Progress"
                        >
                          <BarChart2 className="w-4 h-4 text-primary-500" />
                        </button>
                        <button
                          onClick={() => handleEditRole(user)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          className="p-2 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-danger-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditModal && (
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Edit User Role
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    User
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {editingUser?.first_name?.[0]}
                        {editingUser?.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {editingUser?.first_name} {editingUser?.last_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {editingUser?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Role
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      editingRole === "admin"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-slate-900 dark:text-white">Admin</span>
                      </div>
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={editingRole === "admin"}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="w-5 h-5 text-amber-500"
                      />
                    </label>
                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      editingRole === "learner"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-5 h-5 text-primary-500" />
                        <span className="font-medium text-slate-900 dark:text-white">Learner</span>
                      </div>
                      <input
                        type="radio"
                        name="role"
                        value="learner"
                        checked={editingRole === "learner"}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="w-5 h-5 text-primary-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  disabled={isEditing || editingRole === editingUser?.role}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isEditing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Student Progress Profile
                    </h3>
                    <p className="text-sm text-slate-500">
                      {selectedUserStats?.student.name} ({selectedUserStats?.student.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isStatsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-500">Loading student analytics...</p>
                  </div>
                ) : selectedUserStats ? (
                  <div className="space-y-8">
                    {/* Overall Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3 mb-2">
                          <Clock className="w-5 h-5 text-amber-500" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Interaction Time</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedUserStats.total_hours_spent} hours
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3 mb-2">
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Enrolled Courses</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedUserStats.courses.length}
                        </p>
                      </div>
                    </div>

                    {/* Courses Breakdown */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-primary-500" />
                        <span>Progression per Course</span>
                      </h4>
                      <div className="space-y-6">
                        {selectedUserStats.courses.map((course) => (
                          <div key={course.course_id} className="bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-bold text-slate-900 dark:text-white">{course.course_title}</h5>
                              <span className="text-sm font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                                {Math.round(course.progress_percentage)}% Complete
                              </span>
                            </div>
                            
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                              <div 
                                className="h-full bg-primary-500 transition-all duration-500" 
                                style={{ width: `${course.progress_percentage}%` }}
                              />
                            </div>

                            <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Module Engagement</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {course.modules.map((mod) => (
                                  <div key={mod.lesson_id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                      {mod.completed ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                                      )}
                                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{mod.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                                      <Clock className="w-4 h-4" />
                                      <span>{formatTime(mod.seconds_spent)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-slate-500">Select a student to view their metrics.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UserManagement;
