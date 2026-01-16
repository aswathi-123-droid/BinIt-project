import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc'; // Google Icon
import { FiLogIn } from 'react-icons/fi';  // Login Icon placeholder
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../authSlice';
import { setForgetPassword } from '../authSlice';

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user, loading} = useSelector(state=>state.auth);
  useEffect(()=>{

    if(!loading && user)
      navigate("/services")

  },[user,loading,navigate])

  
  const onSubmit = async(data) => {
    // console.log("Login Data:", data);
    try{
     await dispatch(loginUser(data)).unwrap()
     navigate("/services");
    }catch(err){
     alert(err)
    }
  };

  const handleGoogleLogin = () => {
    console.log("Trigger Google Login...");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-100 p-8 rounded-2xl shadow-lg border border-gray-100">
        
        {/* Header Icon */}
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLogIn className="text-xl text-emerald-500" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Please enter your details to sign in.
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition mb-6"
        >
          <FcGoogle className="text-xl" />
          <span className="text-sm font-medium text-gray-700">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink-0 mx-4 text-gray-400 text-xs">Or sign in with email</span>
          <div className="grow border-t border-gray-200"></div>
        </div>

        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
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
                  message: "Please enter a valid email"
                }
              })}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
              }`}
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          
          <div className="flex justify-end">
            <button onClick={()=>{navigate("/auth/forgot-password")}}>
              <p className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
              Forgot Password?
            </p>
            </button>
            
          </div>

        
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>

        
        <p className="text-center text-xs text-gray-600 mt-6">
          Don't have an account? <Link to="/auth/register" className="text-emerald-600 font-bold hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;