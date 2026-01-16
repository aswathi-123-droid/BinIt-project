import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  Wallet, 
  Tag, 
  Lock, 
  LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../../../api/axiosInstance';
import { logout } from '../../account/authSlice';


const ProfileSidebar = () => {
  const [activeItem, setActiveItem] = useState('My Profile');
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { user} = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'My Profile', icon: User },
    { name: 'My Address', icon: MapPin },
    { name: 'My Pickups', icon: Calendar },
    { name: 'My Wallet', icon: Wallet },
    { name: 'My Coupon', icon: Tag },
    { name: 'Change Password', icon: Lock },
  ];
  

  const handleLogout = async()=>{
    try{
      const res = await api.post("/auth/logout");
      dispatch(logout());
    }catch(err){
      alert("error occurred")
    }
  }

  return (
    <aside className="w-72 min-h-screen bg-gray-50/30 p-6 flex flex-col gap-6 font-sans relative">
      
      
      <div className="flex items-center gap-4 px-2 mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
          {user.name[0]}
        </div>
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
          {user.name}
        </h2>
      </div>

    
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = activeItem === item.name;
          const Icon = item.icon;
        let url = item.name.toLowerCase().split(" ").join("-") 
          return (
            <button
              key={item.name}
              onClick={() => {setActiveItem(item.name); navigate(`/profile/${url}`)}}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-white text-emerald-500 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-50' 
                  : 'text-slate-500 hover:bg-gray-100/50'
              }`}
            >
              <Icon 
                size={20} 
                className={`${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`} 
              />
              <span className={`text-sm font-bold ${isActive ? 'text-emerald-500' : 'text-slate-600'}`}>
                {item.name}
              </span>
            </button>
          );
        })}

        
        <div className="my-4 border-t border-gray-100"></div>

        
        <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Log Out</span>
        </button>
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
