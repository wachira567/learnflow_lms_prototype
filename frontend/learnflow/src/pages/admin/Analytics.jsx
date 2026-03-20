import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, BookOpen, GraduationCap } from "lucide-react";
import analyticsService from "../../services/analyticsService";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [statsData, categoriesData] = await Promise.all([
          analyticsService.getStats(),
          analyticsService.getCategoryDistribution(),
        ]);
        setStats(statsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Category colors
  const categoryColors = [
    "bg-primary-500",
    "bg-secondary-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-purple-500",
    "bg-cyan-500",
    "bg-orange-500",
  ];

  const getCategoryColor = (index) => {
    return categoryColors[index % categoryColors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  const statsData = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users,
          change: "+12%",
          icon: Users,
          color: "bg-blue-500",
        },
        {
          label: "Total Courses",
          value: stats.total_courses,
          change: "+8%",
          icon: BookOpen,
          color: "bg-primary-500",
        },
        {
          label: "Published Courses",
          value: stats.published_courses,
          change: "+5%",
          icon: GraduationCap,
          color: "bg-emerald-500",
        },
        {
          label: "Total Enrollments",
          value: stats.total_enrollments,
          change: "+15%",
          icon: TrendingUp,
          color: "bg-secondary-500",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your platform performance and key metrics.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsData.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 col-span-full">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-emerald-600 font-medium">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No stats available yet. Create courses to see analytics.
            </p>
          </div>
        )}
      </motion.div>

      {/* Charts Row - Placeholder for future implementation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-8"
      >
        {/* Revenue Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Enrollment Trends
            </h3>
            <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>Enrollment trend chart will appear here</p>
          </div>
        </div>

        {/* User Growth Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              User Growth
            </h3>
            <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>User growth chart will appear here</p>
          </div>
        </div>
      </motion.div>

      {/* Top Courses & Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid lg:grid-cols-2 gap-8"
      >
        {/* Top Courses - Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Top Performing Courses
            </h3>
          </div>
          <div className="p-6 text-center text-slate-400">
            <p>Course performance data will appear here</p>
          </div>
        </div>

        {/* Category Distribution - Real Data */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Course Categories
          </h3>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {category.name}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {category.count} courses ({category.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCategoryColor(index)} rounded-full transition-all duration-500`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <p>No course categories available. Create courses to see distribution.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
