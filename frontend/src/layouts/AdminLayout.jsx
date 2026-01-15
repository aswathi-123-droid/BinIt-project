import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../features/admin/components/AdminSidebar';
const AdminLayout = () => {
    return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Shared Admin Sidebar */}
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Shared Admin Navbar */}
        {/* <AdminNavbar /> */}
        
        {/* Dynamic Admin Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;