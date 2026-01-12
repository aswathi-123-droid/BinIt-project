import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form'; // Optional here since we manage OTP state manually, but good for consistency
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../authSlice';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const { handleSubmit } = useForm();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const {email}=location.state

 
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
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const onSubmit = async() => {
    const finalOtp = otp.join("");
    console.log("Submitted OTP:", finalOtp);

    if (!email) {
       alert("Email not found. Please register again.");
       return;
    }
    if(finalOtp === "")
        return
    try{
     await dispatch(verifyEmail({email,otp:finalOtp})).unwrap()
      navigate("/auth/verifysuccess",{state:{message:"email"}})
    }catch(err){
      alert(err)
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
          We've sent a 6-digit verification code to <span className="font-semibold text-gray-700">user@example.com</span>. Please enter the code below to verify your account.
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

         
          <div className="flex justify-between text-xs text-gray-500 px-1 mb-8">
            <button type="button" className="hover:text-gray-700 hover:underline">
            </button>
            <button type="button" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">
              Resend OTP
            </button>
          </div>

          
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition shadow-md mb-6"
          >
            Verify Email
          </button>
        </form>


      </div>
    </div>
  );
};

export default VerifyEmail;