import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Clock, CheckCircle, Users, ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';

const Leaderboard = ({ courseId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [courseId]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/courses/${courseId}/leaderboard`);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err.response?.status === 403 ? 'Leaderboard is private.' : 'Failed to load leaderboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Calculating rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <span>Course Leaderboard</span>
        </h3>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {leaderboard.length} Participants
        </span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Time Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {leaderboard.map((entry) => (
                <tr 
                  key={entry.user_id}
                  className={`group transition-colors ${
                    entry.rank === 1 ? 'bg-amber-50/30 dark:bg-amber-900/10' : 
                    entry.rank === 2 ? 'bg-slate-50/50 dark:bg-slate-800/50' : 
                    'hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {entry.rank === 1 ? (
                        <Medal className="w-5 h-5 text-amber-500" />
                      ) : entry.rank === 2 ? (
                        <Medal className="w-5 h-5 text-slate-400" />
                      ) : entry.rank === 3 ? (
                        <Medal className="w-5 h-5 text-amber-700" />
                      ) : (
                        <span className="text-sm font-semibold text-slate-400 pl-1">{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {entry.avatar ? (
                        <img src={entry.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
                          {entry.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{entry.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mb-1">
                        <span>{Math.round(entry.progress_percentage)}%</span>
                        <span>{entry.completed_lessons}/{entry.total_lessons} Lessons</span>
                      </div>
                      <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${
                            entry.rank === 1 ? 'bg-amber-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${entry.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">{formatTime(entry.total_seconds_spent)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {leaderboard.length === 0 && !isLoading && (
        <p className="text-center text-slate-500 py-6">No progression data available yet.</p>
      )}
    </div>
  );
};

export default Leaderboard;
