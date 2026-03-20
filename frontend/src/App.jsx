import React from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layouts
import MainLayout from "./components/layouts/MainLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Public pages
import Home from "./pages/public/Home";
import Features from "./pages/public/Features";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Learner pages
import LearnerDashboard from "./pages/learner/Dashboard";
import BrowseCourses from "./pages/learner/BrowseCourses";
import CourseDetails from "./pages/learner/CourseDetails";
import LessonViewer from "./pages/learner/LessonViewer";
import MyLearning from "./pages/learner/MyLearning";
import Profile from "./pages/learner/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import CourseManagement from "./pages/admin/CourseManagement";
import LessonManagement from "./pages/admin/LessonManagement";
import UserManagement from "./pages/admin/UserManagement";
import Analytics from "./pages/admin/Analytics";

// Shared components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Auth routes - accessible to guests only */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public routes with main layout - accessible to everyone */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Learner routes - protected - ONLY learners, admins redirect to admin */}
        <Route element={<ProtectedRoute allowedRoles={["learner"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<LearnerDashboard />} />
            <Route path="/courses" element={<BrowseCourses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/courses/:id/learn" element={<LessonViewer />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin routes - protected - only admins */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route
              path="/admin/courses/:id/lessons"
              element={<LessonManagement />}
            />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
