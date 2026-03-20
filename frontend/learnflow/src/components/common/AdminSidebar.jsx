import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isDarkMode } = useTheme();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Courses", icon: BookOpen, href: "/admin/courses" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { name: "Settings", icon: Settings, href: "/admin/profile" },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border-r flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo section */}
      <div
        className={`h-16 flex items-center justify-center border-b ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
      >
        <Link to="/admin" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span
                className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                LearnFlow
              </span>
              <span
                className={`block text-xs ${isDarkMode ? "text-primary-400" : "text-primary-600"}`}
              >
                Admin Panel
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/admin" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? "bg-primary-600 text-white"
                  : isDarkMode
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title={isCollapsed ? item.name : ""}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-white" : ""
                }`}
              />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className={`p-4 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {user?.firstName} {user?.lastName}
              </p>
              <p
                className={`text-xs truncate capitalize ${isDarkMode ? "text-primary-400" : "text-primary-600"}`}
              >
                Administrator
              </p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className={`flex items-center space-x-3 px-3 py-2 w-full rounded-lg transition-all duration-300 ${
            isDarkMode
              ? "text-slate-400 hover:bg-danger-600/20 hover:text-danger-400"
              : "text-slate-600 hover:bg-danger-50 hover:text-danger-600"
          } ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow ${
          isDarkMode
            ? "bg-slate-800 border-slate-700 text-slate-400"
            : "bg-white border-slate-300 text-slate-600"
        }`}
      >
        {isCollapsed ? (
          <ChevronRight
            className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          />
        ) : (
          <ChevronLeft
            className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          />
        )}
      </button>
    </motion.aside>
  );
};

export default AdminSidebar;
