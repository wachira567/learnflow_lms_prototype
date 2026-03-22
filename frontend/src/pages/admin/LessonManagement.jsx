import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  FileText,
  GripVertical,
  X,
  CheckCircle,
  Video,
  UploadCloud,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { api } from '../../services/api';

const LessonManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [notification, setNotification] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    duration: '',
    content: '',
    notes: '',
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await courseService.getCourseById(id);
      setCourse(data);
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      if (selectedLesson) {
        await api.put(`/courses/${id}/lessons/${selectedLesson.id}`, formData);
        showNotification('Lesson updated successfully!');
      } else {
        await courseService.addLesson(id, formData);
        showNotification('Lesson added successfully!');
      }
      setShowCreateModal(false);
      setFormData({
        title: '',
        type: 'video',
        duration: '',
        content: '',
        notes: '',
      });
      setSelectedLesson(null);
      fetchCourse();
    } catch (error) {
      console.error('Error creating lesson:', error);
      showNotification('Failed to add lesson', 'error');
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;
    
    try {
      await api.delete(`/courses/${id}/lessons/${selectedLesson.id}`);
      setShowDeleteModal(false);
      setSelectedLesson(null);
      fetchCourse();
      showNotification('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showNotification('Failed to delete lesson', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingMedia(true);
    try {
      const result = await api.upload('/upload', file);
      setFormData(prev => ({ ...prev, content: result.url }));
      showNotification('Media uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      showNotification('Failed to upload media. Ensure Cloudinary settings are configured in backend.', 'error');
    } finally {
      setUploadingMedia(false);
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
        <button
          onClick={() => navigate('/admin/courses')}
          className="text-primary-600 hover:text-primary-700"
        >
          Back to courses
        </button>
      </div>
    );
  }

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
              notification.type === 'success'
                ? 'bg-success-500 text-white'
                : 'bg-danger-500 text-white'
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
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Manage Lessons
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {course.title} • {lessons.length} lessons
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedLesson(null);
              setFormData({ title: '', type: 'video', duration: '', content: '', notes: '' });
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Lesson</span>
          </button>
        </div>
      </motion.div>

      {/* Lessons List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        {lessons.length === 0 ? (
          <div className="p-12 text-center">
            <Video className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No lessons yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Add your first lesson to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Lesson
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="p-4 flex items-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="cursor-move text-slate-400 hover:text-slate-600">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {index + 1}
                </div>
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  {lesson.type === 'video' ? (
                    <Play className="w-5 h-5 text-primary-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                  <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="capitalize">{lesson.type}</span>
                    <span>•</span>
                    <span>{lesson.duration}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${id}/preview/learn?lesson=${lesson.id}`)}
                    className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Play className="w-4 h-4 text-primary-500" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setFormData({
                        title: lesson.title,
                        type: lesson.type,
                        duration: lesson.duration,
                        content: lesson.content || '',
                        notes: lesson.notes || '',
                      });
                      setShowCreateModal(true);
                    }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-danger-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Lesson Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {selectedLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateLesson} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Enter lesson title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    >
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="e.g., 15:30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Content URL / Body
                  </label>
                  {formData.type === 'video' && (
                     <div className="mb-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                           <UploadCloud className={`w-8 h-8 ${uploadingMedia ? "text-slate-400 animate-pulse" : "text-primary-500"}`} />
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                             {uploadingMedia ? "Uploading to Cloudinary... please wait" : "Click to select a video/image file"}
                           </span>
                           <input type="file" accept="video/*,image/*" className="hidden" onChange={handleMediaUpload} disabled={uploadingMedia} />
                        </label>
                     </div>
                  )}
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={formData.type === 'video' ? 2 : 4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    placeholder={formData.type === 'video' ? 'Enter video URL or upload above' : 'Enter lesson content'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Supplementary Notes / External Links (Optional)
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    placeholder="E.g. Link to PDF, instructions, or extra notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {selectedLesson ? 'Save Changes' : 'Add Lesson'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
              <div className="text-center">
                <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-danger-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Delete Lesson
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete "{selectedLesson?.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteLesson}
                    className="px-6 py-3 bg-danger-600 text-white font-medium rounded-lg hover:bg-danger-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonManagement;
