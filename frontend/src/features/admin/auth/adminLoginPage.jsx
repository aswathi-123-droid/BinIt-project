import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { api } from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../user/account/authSlice';
import { loginAdmin } from './adminSlice';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  const admin = useSelector((state)=>state.adminAuth.admin)
  const dispatch = useDispatch()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });


  const onSubmit = async(data) => {
   console.log("Admin Login Data:", data);
    try{
       await dispatch(loginAdmin(data)).unwrap()
       toast.success("Admin login successful");
       navigate("/admin/dashboard")
    }catch(err){
      toast.error(err?.message || err || "Admin login failed");
    }
  };

    useEffect(() => {
    if (admin?.role=="admin") 
      navigate("/admin/dashboard");
      
  },[admin]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      
      <div className="bg-white w-full max-w-110 p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div className="flex items-center justify-center gap-2 mb-6 text-slate-800">
          <Leaf className="text-emerald-500" size={20} fill="currentColor" fillOpacity={0.2} />
          <span className="text-sm font-bold tracking-tight">BinIt Admin</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access your BinIt administrative portal.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/5 ${
                errors.email ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500/50'
              }`}
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email"
                }
              })}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1 px-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/5 ${
                  errors.password ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500/50'
                }`}
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1 px-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-2"
          >
            Login
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-gray-400">
        <button className="hover:text-emerald-600 transition-colors">Need Help?</button>
        <span className="text-gray-200">•</span>
        <p>© 2024 BinIt Inc. All Rights Reserved.</p>
      </div>

    </div>
  );
};

export default AdminLogin;