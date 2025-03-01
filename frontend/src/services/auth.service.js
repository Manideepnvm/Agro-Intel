import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  applyActionCode,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const authService = {
  async verifyRecaptcha(token) {
    try {
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${import.meta.env.VITE_RECAPTCHA_SECRET_KEY}&response=${token}`
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return false;
    }
  },

  async register(email, password, username, recaptchaToken) {
    try {
      // Verify reCAPTCHA first
      try {
        const verifyResponse = await fetch(`${API_URL}/api/auth/verify-recaptcha`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: recaptchaToken })
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.message || 'Invalid reCAPTCHA');
        }
      } catch (error) {
        if (error.message === 'Failed to fetch') {
          throw new Error('Unable to connect to server. Please try again later.');
        }
        throw error;
      }

      // Continue with registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with username
      await updateProfile(user, {
        displayName: username
      });
      
      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/email-verified`,
        handleCodeInApp: true,
      });
      
      return { user, emailSent: true };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      const token = await user.getIdToken();
      return { user, token };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async verifyEmail(actionCode) {
    try {
      await applyActionCode(auth, actionCode);
      return true;
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  },

  async resendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/email-verified`,
          handleCodeInApp: true,
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      throw error;
    }
  },

  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}; 