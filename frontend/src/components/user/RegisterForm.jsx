import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc'; // Google Icon
import { FaLeaf } from 'react-icons/fa';   // Placeholder for BinIt Logo
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../features/user/account/authSlice';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  
  
  const dispatch = useDispatch();
  const {message,loading} = useSelector((state)=>state.auth)
  const navigate = useNavigate()
  // Watch password to validate "Confirm Password" field
  const password = watch("password");

  const onSubmit =async(data) => {
  try{
    
    await dispatch(registerUser(data)).unwrap()
    navigate("/auth/verify-email",{state:{email:data.email}})
  }catch(err){
    alert(err)
  }
};
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* --- Navbar --- */}
      <header className="p-6">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <FaLeaf className="text-emerald-500" />
          <span>BinIt</span>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="grow flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 text-xl">
              <span role="img" aria-label="user-plus">👤+</span> 
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500 mt-2">
              Join BinIt today and schedule your first eco-friendly pickup.
            </p>
          </div>

          {/* Social Login */}
          <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition mb-6">
            <FcGoogle className="text-xl" />
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink-0 mx-4 text-gray-400 text-xs">Or sign up with email</span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                {...register("fullName", { required: "Full name is required" })}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                {...register("email", { 
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                {...register("terms", { required: "You must agree to the terms" })}
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-gray-500">
                I agree to the <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-sm"
            >
              {loading?"loading...":"Create Account"}
            </button>
            <p>{message}</p>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <a href="/login" className="text-emerald-600 font-medium hover:underline">Log in</a>
          </p>
        </div>
      </main>

      {/* --- Footer (Simplified) --- */}
      {/* <footer className="bg-gray-50 py-10 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold text-gray-900 mb-4">
              <FaLeaf className="text-emerald-500" />
              <span>BinIt</span>
            </div>
            <p className="text-gray-500">Making waste management simple, professional, and sustainable for everyone.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default RegisterForm;