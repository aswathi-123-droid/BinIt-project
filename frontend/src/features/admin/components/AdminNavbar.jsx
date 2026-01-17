import React from 'react';
import {  ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';

const AdminNavbar = ({ pageTitle = 'Dashboard' }) => {
  const admin = useSelector(state=>state.adminAuth.admin)

  const adminUser = {
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK-5-DUAn8F-Uj_pHNDRyprT6W7FV4WVEBtw&s' 
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">

        <button className="flex items-center gap-3 pl-2 pr-3  hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500/20">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={adminUser.avatar}
              alt={`${admin.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
         
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-bold text-gray-800 leading-tight">{admin.name}</span>
            <span className="text-xs font-medium text-gray-500">{admin.role}</span>
          </div>
          <ChevronDown size={18} className="text-gray-400 hidden md:block" />
        </button>

      </div>
    </header>
  );
};

export default AdminNavbar;