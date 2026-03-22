import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  PlayCircle,
  Shield
} from "lucide-react";
import analyticsService from "../../services/analyticsService";
import { courseService } from "../../services/courseService";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  
  // Filter states
  const [courseFilters, setCourseFilters] = useState({
    category: "",
    level: "",
    date_from: "",
    date_to: "",
  });
  const [studentFilters, setStudentFilters] = useState({
    course_id: "",
    status: "",
    date_from: "",
    date_to: "",
  });
  const [userFilters, setUserFilters] = useState({
    role: "",
    date_from: "",
    date_to: "",
  });
  const [activityFilters, setActivityFilters] = useState({
    date_from: "",
    date_to: "",
  });
  const [auditFilters, setAuditFilters] = useState({
    user_id: "",
    action: "",
    search: "",
  });

  // Report data states
  const [courseReport, setCourseReport] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [activityReport, setActivityReport] = useState(null);
  const [auditLogs, setAuditLogs] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Pagination limit state
  const [reportLimit, setReportLimit] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, categoriesData, coursesData] = await Promise.all([
          analyticsService.getStats(),
          analyticsService.getCategoryDistribution(),
          courseService.getAllCourses(),
        ]);
        setStats(statsData);
        setCategories(categoriesData);
        setCourses(coursesData);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate report functions
  const generateCourseReport = async () => {
    setReportLoading(true);
    try {
      const data = await analyticsService.getCourseReport({...courseFilters, limit: reportLimit});
      setCourseReport(data);
    } catch (err) {
      console.error("Failed to generate course report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const generateStudentReport = async () => {
    setReportLoading(true);
    try {
      const data = await analyticsService.getStudentReport({...studentFilters, limit: reportLimit});
      setStudentReport(data);
    } catch (err) {
      console.error("Failed to generate student report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const generateUserReport = async () => {
    setReportLoading(true);
    try {
      const data = await analyticsService.getUserReport({...userFilters, limit: reportLimit});
      setUserReport(data);
    } catch (err) {
      console.error("Failed to generate user report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const generateActivityReport = async () => {
    setReportLoading(true);
    try {
      const data = await analyticsService.getActivityReport({...activityFilters, limit: reportLimit});
      setActivityReport(data);
    } catch (err) {
      console.error("Failed to generate activity report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const generateAuditLogsReport = async () => {
    setReportLoading(true);
    try {
      const data = await analyticsService.getAuditLogs({
        ...auditFilters,
        limit: reportLimit
      });
      setAuditLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setReportLoading(false);
    }
  };

  // Get unique categories and levels for filter dropdowns
  const uniqueCategories = [...new Set(courses.map(c => c.category).filter(Boolean))];
  const uniqueLevels = [...new Set(courses.map(c => c.level).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statsData = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users,
          icon: Users,
          color: "bg-blue-500",
        },
        {
          label: "Total Courses",
          value: stats.total_courses,
          icon: BookOpen,
          color: "bg-primary-500",
        },
        {
          label: "Total Enrollments",
          value: stats.total_enrollments,
          icon: FileText,
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
          Reports & Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Generate detailed reports with filters to analyze your platform data.
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
          statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}
              >
                <stat.icon className="w-6 h-6 text-white" />
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
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No stats available yet. Create courses to see analytics.
            </p>
          </div>
        )}
      </motion.div>

      {/* Report Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "courses", label: "Course Report", icon: BookOpen },
            { id: "students", label: "Student Report", icon: Users },
            { id: "users", label: "User Report", icon: GraduationCap },
            { id: "activity", label: "Activity Report", icon: Clock },
            { id: "audit", label: "Audit Logs", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Report */}
        {activeTab === "courses" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Course Report
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={courseFilters.category}
                    onChange={(e) => setCourseFilters({ ...courseFilters, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Level
                  </label>
                  <select
                    value={courseFilters.level}
                    onChange={(e) => setCourseFilters({ ...courseFilters, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">All Levels</option>
                    {uniqueLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={courseFilters.date_from}
                    onChange={(e) => setCourseFilters({ ...courseFilters, date_from: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={courseFilters.date_to}
                    onChange={(e) => setCourseFilters({ ...courseFilters, date_to: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Results per page:
                  </label>
                  <select
                    value={reportLimit}
                    onChange={(e) => setReportLimit(Number(e.target.value))}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button
                  onClick={generateCourseReport}
                  disabled={reportLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Filter className="w-4 h-4" />
                  {reportLoading ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>

            {/* Course Report Results */}
            {courseReport && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Results: {courseReport.total_courses} courses found
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Course</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Level</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Enrolled</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Completed</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseReport.courses.map((course) => (
                        <tr key={course.id} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{course.title}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{course.category}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{course.level}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${course.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                              {course.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">{course.total_enrollments}</td>
                          <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">{course.completed_enrollments}</td>
                          <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">{course.completion_rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Student Report */}
        {activeTab === "students" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Student Report
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select
                    value={studentFilters.course_id}
                    onChange={(e) => setStudentFilters({ ...studentFilters, course_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={studentFilters.status}
                    onChange={(e) => setStudentFilters({ ...studentFilters, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={studentFilters.date_from}
                    onChange={(e) => setStudentFilters({ ...studentFilters, date_from: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={studentFilters.date_to}
                    onChange={(e) => setStudentFilters({ ...studentFilters, date_to: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Results per page:
                  </label>
                  <select
                    value={reportLimit}
                    onChange={(e) => setReportLimit(Number(e.target.value))}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button
                  onClick={generateStudentReport}
                  disabled={reportLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Filter className="w-4 h-4" />
                  {reportLoading ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>

            {/* Student Report Results */}
            {studentReport && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Results: {studentReport.total_enrollments} enrollments ({studentReport.total_students} unique students)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Student</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Course</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Progress</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Enrolled Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentReport.students.map((student) => (
                        <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{student.student_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{student.student_email}</td>
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{student.course_title}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              student.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              student.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                              {student.status === 'completed' ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
                               student.status === 'in_progress' ? <PlayCircle className="w-3 h-3 inline mr-1" /> :
                               <Clock className="w-3 h-3 inline mr-1" />}
                              {student.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">{student.progress}%</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                            {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Report */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                User Report
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                    <option value="learner">Learner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={userFilters.date_from}
                    onChange={(e) => setUserFilters({ ...userFilters, date_from: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={userFilters.date_to}
                    onChange={(e) => setUserFilters({ ...userFilters, date_to: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Results per page:
                  </label>
                  <select
                    value={reportLimit}
                    onChange={(e) => setReportLimit(Number(e.target.value))}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button
                  onClick={generateUserReport}
                  disabled={reportLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Filter className="w-4 h-4" />
                  {reportLoading ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>

            {/* User Report Results */}
            {userReport && (
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Results: {userReport.total_users} users found
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Enrolled</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Completed</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReport.users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">{user.full_name || '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              user.role === 'instructor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">{user.total_courses_enrolled}</td>
                          <td className="py-3 px-4 text-sm text-right text-slate-900 dark:text-white">{user.courses_completed}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Report */}
        {activeTab === "activity" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Activity Report
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={activityFilters.date_from}
                    onChange={(e) => setActivityFilters({ ...activityFilters, date_from: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={activityFilters.date_to}
                    onChange={(e) => setActivityFilters({ ...activityFilters, date_to: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      Results per page:
                    </label>
                    <select
                      value={reportLimit}
                      onChange={(e) => setReportLimit(Number(e.target.value))}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <button
                    onClick={generateActivityReport}
                    disabled={reportLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Filter className="w-4 h-4" />
                    {reportLoading ? "Generating..." : "Generate Report"}
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Report Results */}
            {activityReport && (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activityReport.new_users}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">New Users</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activityReport.new_enrollments}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">New Enrollments</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activityReport.course_completions}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Completions</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{activityReport.new_courses}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">New Courses</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Recent Users</h4>
                    <div className="space-y-2">
                      {activityReport.recent_users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name || user.email}</div>
                            <div className="text-xs text-slate-500">{user.role}</div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Enrollments */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Recent Enrollments</h4>
                    <div className="space-y-2">
                      {activityReport.recent_enrollments.map((enroll) => (
                        <div key={enroll.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="text-sm text-slate-900 dark:text-white">User {enroll.user_id}</div>
                          <div className="text-xs text-slate-400">
                            {enroll.enrolled_at ? new Date(enroll.enrolled_at).toLocaleDateString() : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === "audit" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Audit Logs - Security Trail
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                View all user activity for security investigations and compliance reporting.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Search User
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    value={auditFilters.search}
                    onChange={(e) => setAuditFilters({ ...auditFilters, search: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by user ID"
                    value={auditFilters.user_id}
                    onChange={(e) => setAuditFilters({ ...auditFilters, user_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Action Type
                  </label>
                  <select
                    value={auditFilters.action}
                    onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">All Actions</option>
                    <option value="user_registered">User Registered</option>
                    <option value="user_login">User Login</option>
                    <option value="google_oauth_login">Google Login</option>
                    <option value="course_created">Course Created</option>
                    <option value="course_updated">Course Updated</option>
                    <option value="course_deleted">Course Deleted</option>
                    <option value="lesson_created">Lesson Created</option>
                    <option value="lesson_completed">Lesson Completed</option>
                    <option value="lesson_incomplete">Lesson Incomplete</option>
                    <option value="course_enrolled">Course Enrolled</option>
                    <option value="course_unenrolled">Course Unenrolled</option>
                    <option value="course_completed">Course Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Results:
                  </label>
                  <select
                    value={reportLimit}
                    onChange={(e) => setReportLimit(Number(e.target.value))}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <button
                  onClick={generateAuditLogsReport}
                  disabled={reportLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  {reportLoading ? "Loading..." : "View Logs"}
                </button>
              </div>
            </div>

            {/* Audit Logs Results */}
            {auditLogs && (
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {auditLogs.length} log entries found
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">When</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Who</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Action</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Resource</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">IP Address</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="text-slate-900 dark:text-white font-medium">
                              {log.user_name || log.user_email || 'System'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {log.user_email ? `ID: ${log.user_id}` : ''}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              log.action?.includes('login') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              log.action?.includes('course') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              log.action?.includes('lesson') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {log.action?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                            {log.resource_type ? `${log.resource_type}${log.resource_id ? ' #' + log.resource_id : ''}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                            {log.ip_address || '-'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400 dark:text-slate-500 hidden lg:table-cell max-w-xs truncate" title={log.user_agent}>
                            {log.user_agent || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Category Distribution (Always Visible) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Course Categories Overview
        </h3>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{category.count} courses</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1">{category.percentage}% of total</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No course categories available. Create courses to see distribution.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;
