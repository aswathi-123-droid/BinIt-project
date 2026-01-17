import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Archive, 
  Layers, 
  Users, 
  Ticket, 
  LogOut,
  Leaf
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/axiosInstance';
import { useDispatch } from 'react-redux';
import { clearAdminState } from '../auth/adminSlice';

const AdminSidebar = () => {
  const [activeItem, setActiveItem] = useState('Users');
  const dispatch = useDispatch()
  const navigate=useNavigate();
  
  const handleAdminLogout = async()=>{
    try{
      const res = await api.post("/admin/auth/admin-logout")
      dispatch(clearAdminState());
      
    }catch(err){
      alert(err)
    }
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Pickups', icon: Truck },
    { name: 'Inventory', icon: Archive },
    { name: 'Categories', icon: Layers },
    { name: 'Users', icon: Users ,},
    { name: 'Coupons', icon: Ticket },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#1e293b] text-slate-300 flex flex-col font-sans border-r border-slate-800">
      
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="text-emerald-500">
          <Leaf size={24} fill="currentColor" fillOpacity={0.2} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">BinIt Admin</span>
      </div>

      <nav className="grow px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeItem === item.name;
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => {setActiveItem(item.name); navigate("/admin/users")}}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon 
                size={20} 
                className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} 
              />
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleAdminLogout} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;