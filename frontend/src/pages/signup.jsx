import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'confirmPassword' || name === 'password') {
      setPasswordMatch(
        name === 'password' ? 
        value === formData.confirmPassword :
        value === formData.password
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordMatch) {
      return;
    }
    console.log("User signed up:", formData);
    navigate("/login");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <motion.div 
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        variants={fadeIn}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <motion.h2 
          className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent"
          variants={fadeIn}
        >
          Create Account
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            className="space-y-2"
            variants={fadeIn}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-200">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition duration-200"
              required
            />
          </motion.div>

          <motion.div 
            className="space-y-2"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-200">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition duration-200"
              required
            />
          </motion.div>

          <motion.div 
            className="space-y-2"
            variants={fadeIn}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-200">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition duration-200"
              required
            />
          </motion.div>

          <motion.div 
            className="space-y-2"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-200">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg bg-black/30 border ${
                formData.confirmPassword 
                  ? passwordMatch 
                    ? 'border-green-500' 
                    : 'border-red-500'
                  : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition duration-200`}
              required
            />
            {formData.confirmPassword && !passwordMatch && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </motion.div>

          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={fadeIn}
            transition={{ delay: 0.5 }}
            disabled={!passwordMatch}
          >
            Create Account
          </motion.button>
        </form>

        <motion.p 
          className="mt-6 text-center text-gray-400"
          variants={fadeIn}
          transition={{ delay: 0.6 }}
        >
          Already have an account?{" "}
          <button 
            onClick={() => navigate("/login")} 
            className="text-green-400 hover:text-green-300 font-medium transition duration-200"
          >
            Sign In
          </button>
        </motion.p>

        <motion.button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-center text-gray-500 hover:text-gray-400 text-sm transition duration-200"
          variants={fadeIn}
          transition={{ delay: 0.7 }}
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SignUp;