import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  ShieldAlert,
  Send,
  Lock,
  Globe,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CourseDiscussions = ({ courseId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/courses/${courseId}/discussions`);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
      setError('Failed to load discussions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/discussions`, {
        content: newComment,
        is_private: isPrivate,
      });
      setNewComment('');
      setIsPrivate(false);
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to post comment:', err);
      if (err.response?.status === 403) {
        alert(err.response.data?.detail || 'You are blocked from posting.');
      } else {
        alert('Failed to post your comment.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await api.put(`/discussions/${editingComment.id}`, {
        content: editContent,
        is_private: editingComment.is_private,
      });
      setEditingComment(null);
      setEditContent('');
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to update comment:', err);
      alert('Failed to update your comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (commentId, voteType) => {
    try {
      await api.post(`/discussions/${commentId}/vote`, {
        vote_type: voteType,
      });
      // Optimistically update or refetch
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to vote:', err);
      if (err.response?.status === 403) {
        alert('You are blocked.');
      }
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/discussions/${commentId}`);
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleBlockUser = async (userId, authorName) => {
    if (!window.confirm(`Are you sure you want to toggle block status for ${authorName}?`)) return;
    try {
      const res = await api.post(`/users/${userId}/block`);
      alert(res.message || 'Block status updated.');
    } catch (err) {
      console.error('Failed to block user:', err);
      alert('Failed to update block status.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-xl text-slate-900 dark:text-white flex items-center space-x-2">
        <MessageCircle className="w-6 h-6 text-primary-500" />
        <span>Course Discussions</span>
      </h4>

      {error && (
        <div className="p-4 bg-danger-50 dark:bg-danger-900/10 text-danger-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Post Box */}
      <form onSubmit={handlePostComment} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ask a question or share your thoughts..."
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-3"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !isPrivate
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Public Post</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isPrivate
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Message Creator</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex items-center justify-center space-x-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            <span>Post</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No discussions yet. Be the first to start!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-xl border ${
                comment.is_private
                  ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              } shadow-sm`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {comment.author_avatar ? (
                      <img src={comment.author_avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.author_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{comment.author_name}</span>
                      {comment.is_private && (
                        <span className="flex items-center space-x-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </span>
                      )}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {(user?.id === comment.user_id || isAdmin) && (
                    <button
                      onClick={() => {
                        setEditingComment(comment);
                        setEditContent(comment.content);
                      }}
                      className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Edit Comment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleBlockUser(comment.user_id, comment.author_name)}
                        className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                        title="Toggle Block User"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingComment?.id === comment.id ? (
                <form onSubmit={handleUpdateComment} className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-3"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingComment(null)}
                      className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !editContent.trim()}
                      className="px-4 py-1.5 text-sm bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      Update
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}

              <div className="flex items-center space-x-4">
                {/* Upvote */}
                <button
                  onClick={() => handleVote(comment.id, 1)}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg transition-colors ${
                    comment.user_vote === 1
                      ? 'text-success-600 bg-success-50 dark:bg-success-900/20'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${comment.user_vote === 1 ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{comment.upvotes}</span>
                </button>

                {/* Downvote (Only toggleable/visible logic) */}
                <button
                  onClick={() => handleVote(comment.id, -1)}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg transition-colors ${
                    comment.user_vote === -1
                      ? 'text-danger-600 bg-danger-50 dark:bg-danger-900/20'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${comment.user_vote === -1 ? 'fill-current' : ''}`} />
                  {/* Admin sees total downvotes, learners only see their own selected state */}
                  {isAdmin && comment.downvotes !== null && (
                    <span className="text-sm font-medium">{comment.downvotes}</span>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseDiscussions;
