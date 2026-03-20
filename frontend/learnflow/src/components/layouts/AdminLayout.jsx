import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../common/AdminSidebar';
import TopBar from '../common/TopBar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        {/* Admin Sidebar */}
        <AdminSidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          
          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
