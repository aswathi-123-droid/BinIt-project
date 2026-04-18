import React from 'react';
import { useForm } from 'react-hook-form';
import { FiRefreshCcw, FiArrowLeft } from 'react-icons/fi'; 
import { forgotPassword } from '../authSlice';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const onSubmit = async(data) => {
    console.log("Password Reset Request for:", data.email);
    try{
        await dispatch(forgotPassword(data)).unwrap();
        console.log("success")
        navigate("/auth/link-success",{state:{email:data.email}})
    }catch(err){
        alert(err)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        
        
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiRefreshCcw className="text-xl text-emerald-500" />
        </div>

       
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        
        
        <p className="text-sm text-gray-500 mb-6">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>

      
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
              }`}
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email address"
                }
              })}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

        
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-md hover:shadow-lg"
          >
            Send Reset Link
          </button>
        </form>

        
        <Link to="/auth/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition group mt-6">
          <FiArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </Link>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;