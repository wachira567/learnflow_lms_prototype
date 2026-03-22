import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Video,
  Menu,
  X,
  FileText,
  Download,
  MessageCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

import CourseDiscussions from '../../components/discussions/CourseDiscussions';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const LessonViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lesson');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, progressData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getProgress(id),
        ]);
        setCourse(courseData);
        setProgress(progressData);
        
        // Set specific lesson if provided, else first incomplete, else first lesson
        let targetLesson = null;
        if (lessonIdParam) {
           targetLesson = courseData.lessons?.find(l => l.id === lessonIdParam);
        }
        if (!targetLesson) {
           targetLesson = courseData.lessons?.find(l => !l.completed) || courseData.lessons?.[0];
        }
        setCurrentLesson(targetLesson);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Telemetry Heartbeat
  useEffect(() => {
    if (isAdmin || !currentLesson) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        await api.post(`/courses/${id}/telemetry`, {
          lesson_id: currentLesson.id,
          seconds_spent: 10
        });
      } catch (err) {
        // Silently fail to not disrupt user experience
        console.debug("Telemetry heartbeat skipped:", err);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(heartbeatInterval);
  }, [id, currentLesson, isAdmin]);

  const handleLessonComplete = async () => {
    if (!currentLesson || isAdmin) return;
    
    setIsMarkingComplete(true);
    try {
      const newCompleted = !currentLesson.completed;
      await courseService.updateProgress(id, currentLesson.id, newCompleted);
      
      // Update local state
      setCurrentLesson({ ...currentLesson, completed: newCompleted });
      
      // Update progress
      const updatedProgress = await courseService.getProgress(id);
      setProgress(updatedProgress);
      
      // Move to next lesson if completing
      if (newCompleted) {
        const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
        const nextLesson = course.lessons[currentIndex + 1];
        if (nextLesson) {
          setTimeout(() => setCurrentLesson(nextLesson), 500);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = course.lessons[currentIndex + 1];
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
    const prevLesson = course.lessons[currentIndex - 1];
    if (prevLesson) {
      setCurrentLesson(prevLesson);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Course not found
        </h2>
        <button
          onClick={() => navigate(isAdmin ? '/admin/courses' : '/courses')}
          className="text-primary-600 hover:text-primary-700"
        >
          Browse all courses
        </button>
      </div>
    );
  }

  const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
  const completedLessons = progress?.completedLessons?.length || 0;
  const totalLessons = course.lessons.length;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  return (
    <div className="h-screen flex flex-col -m-4 sm:-m-6 lg:-m-8">
      {/* Admin Preview Banner */}
      {isAdmin && (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium text-center flex items-center justify-center space-x-2 sticky top-0 z-50">
          <AlertCircle className="w-4 h-4" />
          <span>Preview Mode active. Progress tracking is disabled.</span>
        </div>
      )}

      {/* Top bar */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-40">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(isAdmin ? `/admin/courses/${id}/preview` : `/courses/${id}`)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
              {course.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Lesson {currentIndex + 1} of {totalLessons}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {showSidebar ? (
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video/Content area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video / Media Player */}
          <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center relative group">
            {currentLesson.type === 'video' && currentLesson.content?.includes('cloudinary.com') ? (
              <video 
                controls 
                className="w-full h-full object-contain bg-black"
                src={currentLesson.content}
                poster={currentLesson.content.replace('.mp4', '.jpg').replace('.webm', '.jpg')}
              >
                Your browser does not support the video tag.
              </video>
            ) : currentLesson.type === 'video' ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-white/20 transition-colors">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <p className="text-white/60">No valid video source found.</p>
              </div>
            ) : (
                <div className="p-8 text-center text-white">
                  <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Text Lesson Active</h3>
                  <p className="text-white/60">Read the course contents below.</p>
                </div>
            )}
            
            {/* Lesson info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h2 className="text-white font-semibold text-lg">{currentLesson.title}</h2>
              <div className="flex items-center space-x-2 text-white/60 text-sm mt-1">
                <Clock className="w-4 h-4" />
                <span>{currentLesson.duration}</span>
              </div>
            </div>
          </div>

          {/* Lesson content */}
          <div className="flex-1 p-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                {currentLesson.title}
              </h3>
              
              <div className="prose dark:prose-invert max-w-none">
                {currentLesson.type === 'text' ? (
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm leading-relaxed">
                    {currentLesson.content || "Empty content"}
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {currentLesson.content && !currentLesson.content.includes('http') ? currentLesson.content : (
                      "Watch the attached video lecture above. Ensure you fully understand the topic before marking it as complete."
                    )}
                  </p>
                )}
              </div>

              {/* Notes / Resources */}
              {currentLesson.notes && (
                <div className="mt-8">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Supplementary Notes & Resources
                  </h4>
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {currentLesson.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Discussion */}
              <div className="mt-8">
                <CourseDiscussions courseId={id} />
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <button
                onClick={handlePrevLesson}
                disabled={currentIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                onClick={handleLessonComplete}
                disabled={isMarkingComplete || isAdmin}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMarkingComplete ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : currentLesson.completed && !isAdmin ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Completed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">{isAdmin ? 'Preview Only' : 'Mark as Complete'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextLesson}
                disabled={currentIndex === totalLessons - 1}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Lesson list */}
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: showSidebar ? 0 : 300 }}
          className={`${showSidebar ? 'block' : 'hidden'} lg:block w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Course Content</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {completedLessons} of {totalLessons} completed
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {course.lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => setCurrentLesson(lesson)}
                className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  currentLesson.id === lesson.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600'
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${
                    lesson.completed
                      ? 'text-success-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm line-clamp-2 ${
                      currentLesson.id === lesson.id
                        ? 'text-primary-700 dark:text-primary-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {index + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Play className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {lesson.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LessonViewer;
