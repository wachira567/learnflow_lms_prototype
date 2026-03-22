import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Play,
  ChevronRight,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import learnerService from '../../services/learnerService';

const LearnerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, statsData] = await Promise.all([
          courseService.getAllCourses(),
          learnerService.getStats().catch(() => null),
        ]);
        setCourses(coursesData.slice(0, 4));
        
        // Try to get enrollments
        try {
          const enrollmentsData = await learnerService.getEnrollments();
          setEnrollments(enrollmentsData || []);
        } catch (e) {
          setEnrollments([]);
        }
        
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsData = stats
    ? [
        { 
          label: 'Courses in Progress', 
          value: stats.courses_in_progress || 0, 
          icon: BookOpen, 
          color: 'bg-primary-100 text-primary-600' 
        },
        { 
          label: 'Lessons Completed', 
          value: stats.lessons_completed || 0, 
          icon: Clock, 
          color: 'bg-secondary-100 text-secondary-600' 
        },

        { 
          label: 'Total Enrolled', 
          value: stats.total_enrolled || 0, 
          icon: TrendingUp, 
          color: 'bg-emerald-100 text-emerald-600' 
        },
      ]
    : [
        { label: 'Courses in Progress', value: 0, icon: BookOpen, color: 'bg-primary-100 text-primary-600' },
        { label: 'Lessons Completed', value: 0, icon: Clock, color: 'bg-secondary-100 text-secondary-600' },
        { label: 'Total Enrolled', value: 0, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
      ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here is what is happening with your learning journey today.
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
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Continue Learning Section */}
      {enrollments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Continue Learning
            </h2>
            <Link
              to="/my-learning"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {enrollments.slice(0, 1).map((course) => (
              <div key={course.id} className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary-600" />
                </div>
                <div className="flex-1 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {course.completed_lessons} of {course.total_lessons} lessons completed
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="font-medium text-slate-900 dark:text-white">{course.progress_percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/courses/${course.id}/learn`}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Continue</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recommended for You
          </h2>
          <Link
            to="/courses"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            Browse All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/courses/${course.id}`} className="group block">
                  <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                    <div className="relative h-40 overflow-hidden bg-primary-100 dark:bg-primary-900/30">
                      {course.thumbnail_url || course.banner_url ? (
                        <img 
                          src={course.banner_url || course.thumbnail_url} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary-600" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-medium text-slate-700 dark:text-slate-300 rounded-full">
                          {course.category || 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-500">{course.duration || '0 hours'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No courses available yet. Check back later!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LearnerDashboard;
