import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  Lock,
  Bell,
  Shield,
  Save,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { learnerService } from "../../services/learnerService";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    coursesCompleted: 0,
    lessonsCompleted: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: "",
    website: "",
    location: "",
  });

  // Fetch learner stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await learnerService.getStats();
        setStats({
          totalEnrolled: data.total_enrolled || 0,
          coursesCompleted: data.courses_completed || 0,
          lessonsCompleted: data.lessons_completed || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile(formData);
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      {/* Success message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl flex items-center space-x-3"
        >
          <CheckCircle className="w-5 h-5 text-success-600" />
          <p className="text-success-700 dark:text-success-300">
            Profile updated successfully!
          </p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto">
                <span className="text-4xl font-bold text-white">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 capitalize">
              {user?.role}
            </p>

            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoadingStats ? "-" : stats.totalEnrolled}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Courses
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoadingStats ? "-" : stats.coursesCompleted}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Completed
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoadingStats ? "-" : stats.lessonsCompleted}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lessons
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Profile Information
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Settings Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Password
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Change your password
                  </p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Update Password
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your notifications
                  </p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Configure
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Privacy
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your privacy settings
                  </p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Manage Privacy
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-danger-100 dark:bg-danger-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-danger-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Account
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Delete your account
                  </p>
                </div>
              </div>
              <button className="text-danger-600 hover:text-danger-700 text-sm font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
