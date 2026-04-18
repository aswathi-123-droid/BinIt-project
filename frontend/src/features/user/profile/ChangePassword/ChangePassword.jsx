import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck 
} from 'lucide-react';
import { api } from '../../../../api/axiosInstance';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting }
  } = useForm({
    mode: "onChange" 
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data) => {
    try{
      const res =await api.patch("/account/update-password",data)
      toast.success("Password changed successfully!");
      reset(); 
    }catch(err){
      const errorMessage = err.response?.data?.message || err.message || "Failed to update password";
      toast.error(errorMessage);
    }
  };

  const getInputStyle = (error) => `
    w-full pl-12 pr-12 py-3 bg-gray-50/50 border rounded-xl text-sm font-semibold transition-all outline-none
    ${error 
      ? 'border-red-500 text-red-900 focus:ring-red-100 focus:border-red-500' 
      : 'border-gray-200 text-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5'}
  `;

  return (
    <div className="flex-1 bg-white min-h-screen p-8 font-sans">
      
      <div className="mb-8 max-w-3xl mx-auto  ">
        <h1 className=" text-2xl font-bold text-slate-900">Security Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your password to keep your account secure.
        </p>
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="max-w-3xl  mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        
        <div className="h-32 bg-emerald-50/60 w-full flex items-end p-6">
           <h2 className="text-xl font-bold text-emerald-900">Change Password</h2>
        </div>

        <div className="px-8 py-6">
          
          <div className="flex items-center gap-2 mb-8 text-emerald-600">
            <ShieldCheck size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Password Details</h3>
          </div>

          <div className="space-y-6 max-w-xl">
            
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showCurrentPass ? "text" : "password"}
                  {...register("currentPassword", { 
                    required: "Current password is required" 
                  })}
                  className={getInputStyle(errors.currentPassword)}
                  placeholder="Enter current password"
                />
                
                <button 
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors outline-none"
                >
                  {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-500 mt-1 ml-1">{errors.currentPassword.message}</p>}
            </div>

           
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showNewPass ? "text" : "password"}
                  {...register("newPassword", { 
                    required: "New password is required",
                    minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters long"
                    },
                    
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: "Must contain uppercase, lowercase, number and special character"
                    }
                  })}
                  className={getInputStyle(errors.newPassword)}
                  placeholder="Enter new password (min 8 chars)"
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors outline-none"
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 mt-1 ml-1">{errors.newPassword.message}</p>}
            </div>

             
             <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showConfirmPass ? "text" : "password"}
                  {...register("confirmPassword", { 
                    required: "Please confirm your new password",
                    validate: (value) => 
                      value === newPasswordValue || "The passwords do not match"
                  })}
                  className={getInputStyle(errors.confirmPassword)}
                  placeholder="Re-enter new password"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors outline-none"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{errors.confirmPassword.message}</p>}
            </div>

          </div>

         
          <div className="flex justify-end items-center gap-4 mt-12 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              onClick={() => reset()}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!isDirty || isSubmitting}
              className={`px-8 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-md ${
                isDirty && !isSubmitting
                  ? 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg active:scale-95' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;