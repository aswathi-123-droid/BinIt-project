import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaLock } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../authSlice'; // Ensure resendOtp thunk exists
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../../../api/axiosInstance';

const VerifyEmail = () => {
  const { handleSubmit } = useForm();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(60); // 1. Timer state (60 seconds)
  const [canResend, setCanResend] = useState(false); // 2. Resend toggle
  const inputRefs = useRef([]);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // 3. Timer logic using useEffect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true); // Enable button when timer reaches 0
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [timer]);

  // 4. Resend OTP Handler
  const handleResendOtp = async () => {
    try {
      // Dispatch your resend OTP thunk
      const res = await api.post("/auth/resend-verification-otp",{email})
      // Reset state on success
      setOtp(new Array(6).fill("")); // Clear previous OTP inputs
      setTimer(60); // Restart countdown
      setCanResend(false);
      inputRefs.current[0].focus();
      alert("Verification code resent successfully!");
      return res.data
    } catch (err) {
      alert(err || "Failed to resend OTP");
    }
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmit = async () => {
    const finalOtp = otp.join("");
    if (!email) {
      alert("Email not found. Please register again.");
      return;
    }
    if (finalOtp.length < 6) return alert("Please enter the full code");

    try {
      await dispatch(verifyEmail({ email, otp: finalOtp })).unwrap();
      navigate("/auth/verifysuccess", { state: { message: "email" } });
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 text-lg">
          <FaLock />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
        <p className="text-sm text-gray-500 mb-8">
          We've sent a 6-digit code to <span className="font-semibold text-gray-700">{email || "your email"}</span>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition text-gray-700"
              />
            ))}
          </div>

          <div className="flex justify-center text-xs px-1 mb-8">
            {/* 5. Conditional rendering for timer vs button */}
            {!canResend ? (
              <p className="text-gray-500">
                Resend code in <span className="font-bold text-emerald-600">{timer}s</span>
              </p>
            ) : (
              <button 
                type="button" 
                onClick={handleResendOtp}
                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-md"
          >
            Verify Email
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;