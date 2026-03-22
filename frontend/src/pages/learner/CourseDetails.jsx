import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Play,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  ChevronRight,
  Award,
  Globe,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

import Leaderboard from '../../components/leaderboard/Leaderboard';
import { courseService } from '../../services/courseService';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseData, progressData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getProgress(id),
        ]);
        setCourse(courseData);
        setProgress(progressData);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleStartLearning = async () => {
    if (isAdmin) {
      navigate(`/admin/courses/${course.id}/preview/learn`);
      return;
    }

    if (course.is_enrolled) {
      navigate(`/courses/${course.id}/learn`);
      return;
    }

    setIsEnrolling(true);
    try {
      await courseService.enrollCourse(id);
      // Wait a moment for backend to sync if needed, but usually it's immediate
      navigate(`/courses/${course.id}/learn`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Course not found
        </h2>
        <Link to="/courses" className="text-primary-600 hover:text-primary-700">
          Browse all courses
        </Link>
      </div>
    );
  }

  const completedLessons = progress?.completedLessons?.length || 0;
  const totalLessons = course.lessons?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        to={isAdmin ? '/admin/courses' : '/courses'}
        className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to courses
      </Link>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 lg:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {course.level}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {course.title}
              </h1>
              <div className="flex items-center space-x-4 text-white/80">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-5 h-5" />
                  <span>{course.enrolledStudents.toLocaleString()} students</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {['overview', 'curriculum', 'instructor', (course?.is_leaderboard_public || isAdmin) && 'leaderboard'].filter(Boolean).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      About this course
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      What you will learn
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        'Master the fundamentals',
                        'Build real-world projects',
                        'Get hands-on experience',
                        'Learn industry best practices',
                        'Understand core concepts',
                        'Prepare for advanced topics',
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Duration</p>
                        <p className="font-medium text-slate-900 dark:text-white">{course.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-secondary-600" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Lessons</p>
                        <p className="font-medium text-slate-900 dark:text-white">{course.lessonsCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Language</p>
                        <p className="font-medium text-slate-900 dark:text-white">English</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'curriculum' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Course Content
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {totalLessons} lessons • {course.duration}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {course.lessons?.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            lesson.completed
                              ? 'bg-success-100 dark:bg-success-900/30 text-success-600'
                              : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                          }`}>
                            {lesson.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <p className={`font-medium ${
                              lesson.completed
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                              <Play className="w-3 h-3" />
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'instructor' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={course.instructorAvatar}
                      alt={course.instructor}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {course.instructor}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">Senior Instructor</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">50K+ students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">4.9 rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Experienced instructor with over 10 years of industry experience.
                    Passionate about teaching and helping students achieve their goals.
                  </p>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Leaderboard courseId={id} />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
            {/* Progress */}
            {progressPercentage > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Your progress</span>
                  <span className="font-medium text-slate-900 dark:text-white">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {completedLessons} of {totalLessons} lessons completed
                </p>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleStartLearning}
              disabled={isEnrolling}
              className="w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50"
            >
              {isEnrolling ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>{course.is_enrolled ? 'Continue Learning' : 'Start Learning'}</span>
                </>
              )}
            </button>

            {/* Course includes */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                This course includes:
              </h4>
              <ul className="space-y-3">
                {[
                  { icon: Play, text: `${course.duration} on-demand video` },
                  { icon: BookOpen, text: `${course.lessonsCount} lessons` },
                  { icon: Calendar, text: 'Lifetime access' },
                  { icon: Award, text: 'Certificate of completion' },
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>


          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseDetails;
