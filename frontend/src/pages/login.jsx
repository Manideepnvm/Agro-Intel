import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User logged in:", formData);
    navigate("/dashboard");
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
          Welcome Back
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
              placeholder="Enter your username"
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
            <label className="block text-sm font-medium text-gray-200">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition duration-200"
              required
            />
          </motion.div>

          <motion.div 
            className="flex items-center justify-between text-sm"
            variants={fadeIn}
            transition={{ delay: 0.3 }}
          >
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-2 rounded" />
              Remember me
            </label>
            <button 
              type="button" 
              className="text-green-400 hover:text-green-300 transition duration-200"
            >
              Forgot Password?
            </button>
          </motion.div>

          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            Sign In
          </motion.button>
        </form>

        <motion.p 
          className="mt-6 text-center text-gray-400"
          variants={fadeIn}
          transition={{ delay: 0.5 }}
        >
          Don&apos;t have an account?{" "}
          <button 
            onClick={() => navigate("/signup")} 
            className="text-green-400 hover:text-green-300 font-medium transition duration-200"
          >
            Sign Up
          </button>
        </motion.p>

        <motion.button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-center text-gray-500 hover:text-gray-400 text-sm transition duration-200"
          variants={fadeIn}
          transition={{ delay: 0.6 }}
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;
