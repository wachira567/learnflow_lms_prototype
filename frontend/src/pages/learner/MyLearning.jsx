import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  ChevronRight,
  Pause,
  Trash2,
  X
} from "lucide-react";
import learnerService from "../../services/learnerService";
import { courseService } from "../../services/courseService";

const MyLearning = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("in-progress");
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, enrollmentsData] = await Promise.all([
          learnerService.getStats().catch(() => null),
          learnerService.getEnrollments().catch(() => []),
        ]);
        setStats(statsData);
        setEnrollments(enrollmentsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUnenroll = async () => {
    if (!selectedCourse) return;
    setIsUnenrolling(true);
    try {
      await courseService.unenrollCourse(selectedCourse.id);
      setEnrollments(prev => prev.filter(e => e.id !== selectedCourse.id));
      setShowUnenrollModal(false);
      setSelectedCourse(null);
      // Refresh stats
      const statsData = await learnerService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error unenrolling:", error);
    } finally {
      setIsUnenrolling(false);
    }
  };

  const statsData = stats
    ? [
        {
          label: "Courses in Progress",
          value: stats.courses_in_progress || 0,
          icon: BookOpen,
          color: "bg-primary-100 text-primary-600",
        },
        {
          label: "Completed",
          value: stats.courses_completed || 0,
          icon: CheckCircle,
          color: "bg-success-100 text-success-600",
        },
        {
          label: "Lessons Completed",
          value: stats.lessons_completed || 0,
          icon: Clock,
          color: "bg-secondary-100 text-secondary-600",
        },
        {
          label: "Certificates",
          value: stats.courses_completed || 0,
          icon: Trophy,
          color: "bg-amber-100 text-amber-600",
        },
      ]
    : [
        {
          label: "Courses in Progress",
          value: 0,
          icon: BookOpen,
          color: "bg-primary-100 text-primary-600",
        },
        {
          label: "Completed",
          value: 0,
          icon: CheckCircle,
          color: "bg-success-100 text-success-600",
        },
        {
          label: "Lessons Completed",
          value: 0,
          icon: Clock,
          color: "bg-secondary-100 text-secondary-600",
        },
        {
          label: "Certificates",
          value: 0,
          icon: Trophy,
          color: "bg-amber-100 text-amber-600",
        },
      ];

  const inProgressCourses = enrollments.filter((c) => !c.is_completed);
  const completedCourses = enrollments.filter((c) => c.is_completed);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Learning
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your progress and continue your learning journey.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsData.map((stat, index) => (
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

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit mb-6">
          {[
            { id: "in-progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl h-32 animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === "in-progress" ? (
          inProgressCourses.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No courses in progress
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Start learning by browsing our courses
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <span>Browse Courses</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-32 md:h-auto bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary-600" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            {course.completed_lessons} of {course.total_lessons}{" "}
                            lessons completed
                          </p>

                          {/* Progress bar */}
                          <div className="w-full md:w-96">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-slate-600 dark:text-slate-400">
                                Progress
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {course.progress_percentage}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${course.progress_percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col gap-2">
                          <Link
                            to={`/courses/${course.id}/learn`}
                            className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            <span>Continue</span>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowUnenrollModal(true);
                            }}
                            className="inline-flex items-center justify-center space-x-2 px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Unenroll</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : completedCourses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl">
            <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No completed courses yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Keep learning to earn your first certificate!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-32 md:h-auto bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-success-600" />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {course.title}
                          </h3>
                          <span className="px-2 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-xs font-medium rounded-full">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {course.completed_lessons} lessons completed
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        <button className="px-4 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors text-sm font-medium">
                          View Certificate
                        </button>
                        <Link
                          to={`/courses/${course.id}/learn`}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Unenroll Modal */}
      <AnimatePresence>
        {showUnenrollModal && (
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 text-center"
            >
              <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Unenroll from Course?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to unenroll from <strong>{selectedCourse?.title}</strong>? 
                This will clear all your progress data for this course.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowUnenrollModal(false)}
                  className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnenroll}
                  disabled={isUnenrolling}
                  className="px-6 py-2 bg-danger-600 text-white font-semibold rounded-xl hover:bg-danger-700 transition-all disabled:opacity-50"
                >
                  {isUnenrolling ? "Unenrolling..." : "Yes, Unenroll"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyLearning;
