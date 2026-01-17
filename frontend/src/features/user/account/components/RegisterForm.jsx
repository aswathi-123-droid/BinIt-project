import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc'; 
import { FaLeaf } from 'react-icons/fa';  
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../authSlice';

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  
  
  const dispatch = useDispatch();
  const {loading} = useSelector((state)=>state.auth)
  const navigate = useNavigate()
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
      
      
      <header className="p-6">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <FaLeaf className="text-emerald-500" />
          <span>BinIt</span>
        </div>
      </header>

      
      <main className="grow flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-100">
          
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 text-xl">
              <span role="img" aria-label="user-plus">👤+</span> 
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500 mt-2">
              Join BinIt today and schedule your first eco-friendly pickup.
            </p>
          </div>

         
          <div className="w-full flex justify-center mb-6">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                dispatch(googleLogin(credentialResponse.credential));
                navigate("/services"); 
              }}
              onError={() => {
                alert("Google Login Failed");
              }}
              width="320px" 
              theme="outline"
              shape="rectangular"
            />
          </div>  

         
          <div className="relative flex py-2 items-center mb-6">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink-0 mx-4 text-gray-400 text-xs">Or sign up with email</span>
            <div className="grow border-t border-gray-200"></div>
          </div>

         
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g., +1 (555) 123-4567"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                {...register("phone", { 
                  required: "Phone Number is required",
                  pattern: {value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,message: "Invalid phone number format"}
                })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

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

            
            <button
              type="submit"
              className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-sm"
            >
              {loading?"loading...":"Create Account"}
            </button>
          </form>

          
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <Link to="/auth/login" className="text-emerald-600 font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterForm;