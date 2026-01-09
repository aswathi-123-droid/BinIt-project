import { FiMail, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PasswordResetSent = () => {
  const navigate = useNavigate()
  const handleBackToLogin = () => {
    navigate('/auth/login'); 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center">
        
        {/* Success Mail Icon */}
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="relative">
            <FiMail className="text-3xl text-emerald-500" />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <div className="bg-emerald-500 rounded-full p-0.5">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-emerald-500 mb-4 tracking-tight">
          Password Reset Link Sent!
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
          A password reset link has been sent to your registered email address. 
          Please check your inbox (and spam folder) to reset your password.
        </p>

        {/* Expiration Info Box */}
        <div className="flex items-center justify-center gap-2 bg-gray-50 py-3 px-4 rounded-xl mb-8 border border-gray-100">
          <FiClock className="text-gray-400" />
          <p className="text-xs font-medium text-gray-500">
            The link is valid for 10 minutes.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBackToLogin}
          className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-2xl hover:bg-emerald-600 transition duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Go back to Login
        </button>

      </div>
    </div>
  );
};

export default PasswordResetSent;