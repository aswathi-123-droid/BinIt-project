import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../features/admin/components/AdminSidebar';
import AdminNavbar from '../features/admin/components/AdminNavbar';
const AdminLayout = () => {
  const location = useLocation();

  const titleMap = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'User Management'
  }

  const currentTitle = titleMap[location.pathname] || 'Dashboard';
    return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Shared Admin Sidebar */}
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Shared Admin Navbar */}
        <AdminNavbar pageTitle={currentTitle}/>
        
        {/* Dynamic Admin Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;