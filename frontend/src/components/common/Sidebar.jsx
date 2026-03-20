import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Browse Courses', icon: BookOpen, href: '/courses' },
    { name: 'My Learning', icon: GraduationCap, href: '/my-learning' },
    { name: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo section */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              LearnFlow
            </span>
          )}
        </Link>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : ''
                }`}
              />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                {user?.role}
              </p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className={`flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-slate-600 dark:text-slate-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:text-danger-600 dark:hover:text-danger-400 transition-all duration-300 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        )}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
