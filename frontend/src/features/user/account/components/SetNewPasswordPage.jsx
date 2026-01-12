import { useForm } from 'react-hook-form';
import { FiRefreshCcw, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../../api/axiosInstance';

const SetNewPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()
  const {token} = useParams();
  console.log(token)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Watch the 'password' field to validate the confirmation field
  const password = watch("password");

  const onSubmit = async(data) => {
    console.log("Password Reset Form Submitted:", data);
    try{
      setLoading(true)
      const res =await api.post("/auth/reset-password",{token:token,password:data.password,confirmPassword: data.confirmPassword})
      const result=res.data.message;
      setLoading(false)
       navigate("/auth/verifysuccess",{state:{message:"password"}})
    }catch(err){
      alert(err)
    }
    
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center">
        
        
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiRefreshCcw className="text-xl text-emerald-500" />
        </div>

      
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
        
        
        <p className="text-sm text-gray-500 mb-8">
          Your identity has been verified. Please create a strong password to secure your account.
        </p>

        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
                }`}
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters long" }
                })}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
                }`}
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-md hover:shadow-lg mt-6"
          >
            {loading?"Resetting Password":"Reset Password"}
          </button>
        </form>

        
        <a href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition group mt-8">
          <FiArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </a>

      </div>
    </div>
  );
};

export default SetNewPasswordPage;