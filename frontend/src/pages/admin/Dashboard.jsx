import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import analyticsService from "../../services/analyticsService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          coursesData,
          statsData,
          categoriesData,
          enrollmentData,
        ] = await Promise.all([
          analyticsService.getCoursesWithEnrollments(),
          analyticsService.getStats(),
          analyticsService.getCategoryDistribution().catch(() => []),
          analyticsService.getEnrollmentTrends(timeRange).catch(() => []),
        ]);
        
        // Sort by created_at and take only 3 most recent
        const sortedCourses = [...coursesData]
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 3);
        
        setCourses(sortedCourses);
        setStats(statsData);
        setCategoryData(categoriesData);
        setEnrollmentTrends(enrollmentData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update enrollment trends when timeRange changes
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await analyticsService.getEnrollmentTrends(timeRange);
        setEnrollmentTrends(data);
      } catch (error) {
        console.error("Error fetching enrollment trends:", error);
      }
    };
    fetchTrends();
  }, [timeRange]);

  const statsData = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users,
          icon: Users,
          color: "bg-blue-500",
          trend: "up",
          change: "+12%",
        },
        {
          label: "Total Courses",
          value: stats.total_courses,
          icon: BookOpen,
          color: "bg-primary-500",
          trend: "up",
          change: "+8%",
        },
        {
          label: "Total Enrollments",
          value: stats.total_enrollments,
          icon: Activity,
          color: "bg-secondary-500",
          trend: "up",
          change: "+15%",
        },
      ]
    : [];

  // Prepare category data for pie chart
  const pieColors = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];
  const categoryChartData = categoryData.length > 0
    ? categoryData.map((item, index) => ({
        name: item.name || item.category,
        value: item.count,
        color: pieColors[index % pieColors.length],
      }))
    : [
        { name: "Programming", value: 12, color: "#6366f1" },
        { name: "Design", value: 8, color: "#8b5cf6" },
        { name: "Business", value: 6, color: "#ec4899" },
        { name: "Marketing", value: 4, color: "#14b8a6" },
      ];

  // Format enrollment trends for display
  const formatEnrollmentTrends = () => {
    if (enrollmentTrends.length === 0) return [];
    
    if (enrollmentTrends.length > 14) {
      const weeks = [];
      for (let i = 0; i < enrollmentTrends.length; i += 7) {
        const week = enrollmentTrends.slice(i, i + 7);
        const weekEnrollments = week.reduce((sum, d) => sum + (d.enrollments || 0), 0);
        const weekCompletions = week.reduce((sum, d) => sum + (d.completions || 0), 0);
        weeks.push({
          name: `Week ${Math.floor(i / 7) + 1}`,
          enrollments: weekEnrollments,
          completions: weekCompletions,
        });
      }
      return weeks;
    }
    
    return enrollmentTrends.map(d => ({
      name: d.date ? d.date.slice(5) : d.date,
      enrollments: d.enrollments || 0,
      completions: d.completions || 0,
    }));
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
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of your platform performance and key metrics.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : statsData.length > 0 ? (
          statsData.map((stat, index) => (
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
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    stat.trend === "up" ? "text-emerald-600" : "text-danger-600"
                  }`}
                >
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No data available yet. Create courses and enroll users to see statistics.
            </p>
          </div>
        )}
      </motion.div>

      {/* Charts Row - Only Enrollment Trends and Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-8"
      >
        {/* Enrollment Trends Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Enrollment Trends
            </h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="h-64">
            {enrollmentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatEnrollmentTrends()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1" }}
                    name="Enrollments"
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ fill: "#14b8a6" }}
                    name="Completions"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No enrollment data available yet
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Enrollments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Completions</span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Courses by Category
          </h3>
          <div className="flex items-center">
            <div className="h-48 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              {categoryChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Courses - Limited to 3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Courses
          </h3>
          <Link
            to="/admin/courses"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : courses.length > 0 ? (
            courses.map((course, index) => (
              <div
                key={course.id}
                className="p-4 flex items-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {index + 1}
                </span>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {course.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {course.category} • {course.level}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {course.enrollments || 0} students
                  </span>
                  <Link
                    to="/admin/courses"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-primary-600 hover:text-primary-700"
                    title="Manage Course"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No courses yet. Create your first course to get started.
              <Link
                to="/admin/courses"
                className="block mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Create Course →
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
