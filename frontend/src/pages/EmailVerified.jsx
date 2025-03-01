import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const oobCode = searchParams.get('oobCode');
        if (!oobCode) {
          setStatus('error');
          return;
        }

        await authService.verifyEmail(oobCode);
        setStatus('success');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please login to continue.' 
            }
          });
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="text-green-400 hover:text-green-300"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-green-400 hover:text-green-300"
              >
                Login
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerified; 