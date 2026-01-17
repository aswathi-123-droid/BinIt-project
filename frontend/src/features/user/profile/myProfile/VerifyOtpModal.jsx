import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../../../../api/axiosInstance';
import { useDispatch } from 'react-redux';
import { getProfile } from '../../account/authSlice';

const OtpVerifyModal = ({ isOpen, onClose, email}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer,setTimer] = useState(60);
  const [canResend,setCanResend] = useState(false)
  const dispatch = useDispatch();

  useEffect(()=>{
    let interval;
    if(timer>0){
      interval = setInterval(()=>{
        setTimer((prev)=>prev-1);
      },1000)
    }else{
      setCanResend(true);
      clearInterval(interval)
    }
    return ()=> clearInterval(interval)
  },[timer])

  if (!isOpen) return null;

  
  const handleResendOtp = async()=>{
     try {
       const res = await api.post("/account/request-email-otp",{email})
       setOtp(""); 
       setTimer(60);
       setCanResend(false);
       alert("Verification code resent successfully!");
       return res.data
     } catch (err) {
       alert(err || "Failed to resend OTP");
     }
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      console.log(otp)
     const data = await api.post("/account/verify-email-otp",{otp})
     await dispatch(getProfile()).unwrap()
     onClose()
    } catch (err) {
      setError(err.message  );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        <div className="bg-linear-to-r from-emerald-50 to-white px-6 py-4 flex items-center justify-between border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="p-2 bg-emerald-100 rounded-full">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg">Verify New Email</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-8">
          <p className="text-center text-slate-600 mb-6">
            We've sent a verification code to <br/>
            <span className="font-bold text-slate-800 text-lg">{email}</span>
          </p>

          <form onSubmit={handleVerify}>
            <div className="mb-3">
              <label className="sr-only">One-Time Password</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter Code"
                className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-2xl font-mono tracking-[0.5em] text-center font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all ${
                  error ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-200'
                }`}
                maxLength={6}
                autoFocus
              />
              {error && <p className="mt-2 text-center text-sm text-red-500 font-medium animate-pulse">{error}</p>}
            </div>
            <div className="flex flex-col items-end min-h-10">
            {!canResend ? (
              <p className="text-gray-500">
                Resend code in <span className="font-bold text-emerald-600">{timer}s</span>
              </p>
            ) : (
              <button 
                type="button" 
                onClick={handleResendOtp}
                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline "
              >
                Resend OTP
              </button>
            )}
          </div>
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || !otp}
                className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : (
                  <>
                    Confirm Update <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 text-slate-500 font-semibold text-sm hover:text-slate-800 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyModal;
