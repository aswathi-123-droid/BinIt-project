import { FaCheck } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const EmailVerifiedSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {message} = location.state
  const handleLoginRedirect = () => {
    console.log("Redirecting to login...");
    navigate('/auth/login'); 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center">
        
       
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-short">
          <FaCheck className="text-3xl text-emerald-500" />
        </div>

     
        <h1 className="text-2xl font-bold text-emerald-500 mb-3">
          {message} Verified <br /> Successfully!
        </h1>

        
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Your {message} has been successfully verified. You can now log in to your account.
        </p>

        
        <button
          onClick={handleLoginRedirect}
          className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-lg hover:bg-emerald-600 transition duration-200 shadow-md hover:shadow-lg"
        >
          Go back to Login
        </button>

      </div>
    </div>
  );
};

export default EmailVerifiedSuccess;