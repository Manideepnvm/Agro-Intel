import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    
    if (oobCode) {
      verifyEmail(oobCode);
    }
  }, [searchParams]);

  const verifyEmail = async (code) => {
    try {
      await authService.verifyEmail(code);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md text-center"
      >
        {status === 'verifying' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">
              Verifying your email...
            </h2>
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-300">
              Redirecting to login page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-300 mb-4">
              The verification link may have expired or is invalid.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="text-green-400 hover:text-green-300"
            >
              Return to Sign Up
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerification; 