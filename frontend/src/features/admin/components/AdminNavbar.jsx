import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

const AdminNavbar = ({ pageTitle = 'Dashboard' }) => {
  // Mock admin user data - replace with real data from your auth system
  const adminUser = {
    name: 'Al Ameen S',
    role: 'Super Admin',
    // Using a placeholder avatar similar to your other examples
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' 
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 font-sans">
      
      {/* Left Side: Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{pageTitle}</h1>
      </div>

      {/* Right Side: Search, Notifications, Profile */}
      <div className="flex items-center gap-4 md:gap-6">

        {/* Search Bar (Hidden on smaller screens for responsiveness) */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search here..."
            className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
          <Bell size={22} />
          {/* Notification Badge (Red Dot) */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown Trigger */}
        <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500/20">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={adminUser.avatar}
              alt={`${adminUser.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Name & Role (Hidden on mobile to save space) */}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-bold text-gray-800 leading-tight">{adminUser.name}</span>
            <span className="text-xs font-medium text-gray-500">{adminUser.role}</span>
          </div>
          <ChevronDown size={18} className="text-gray-400 hidden md:block" />
        </button>

      </div>
    </header>
  );
};

export default AdminNavbar;