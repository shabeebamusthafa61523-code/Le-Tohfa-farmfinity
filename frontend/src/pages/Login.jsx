import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authSuccess } from '../redux/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast'; // Add this line
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await axios.post(`${API_URL}/api/auth/login`, formData);

      // 1. Extract data clearly
      const { user, token } = response.data;

      // 2. Update Redux (The slice handles the initial localStorage sync)
      dispatch(authSuccess({ user, token }));

      // 3. Double-check localStorage manually for the Interceptor to pick up immediately
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      
      // 4. Navigate only after everything is set
      navigate('/');
      
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'The credentials provided do not match our records.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex bg-[#f4f7f4] selection:bg-[#8ba88b]/30">
      
      {/* Left Side: Visual Experience */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2d3a2d] relative items-center justify-center overflow-hidden">
        {/* Fixed the image path syntax here */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-[10s] hover:scale-110"
          style={{ backgroundImage: "url('/assets/a.JPG')" }}
        />
        
        <div className="relative z-10 text-center text-white px-12">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-serif mb-4"
          >
            Le'Tohfa
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-light tracking-[0.3em] uppercase italic opacity-80"
          >
            The essence of nature.
          </motion.p>
        </div>
      </div>

      {/* Right Side: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif text-[#2d3a2d] mb-2 italic">Welcome Back</h2>
            <p className="text-gray-400 font-light">Please enter your details to sign in</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 italic"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#2d3a2d] font-bold mb-3">
                Email Address
              </label>
              <input 
                type="email" 
                required
                autoComplete="email"
                className="w-full px-6 py-4 rounded-2xl bg-white border border-[#e0e7e0] focus:ring-2 focus:ring-[#8ba88b] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                placeholder="hello@letohfa.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#2d3a2d] font-bold">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#8ba88b] transition-colors">
                  Forgot?
                </Link>
              </div>
              <input 
                type="password" 
                required
                autoComplete="current-password"
                className="w-full px-6 py-4 rounded-2xl bg-white border border-[#e0e7e0] focus:ring-2 focus:ring-[#8ba88b] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-5 rounded-2xl font-serif italic text-lg shadow-lg transition-all flex justify-center items-center
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2d3a2d] text-white hover:bg-[#3d4d3d] hover:shadow-xl'}
              `}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Aligning stars...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <p className="mt-10 text-center text-gray-400 text-sm italic">
            Don't have an account? <Link to="/register" className="text-[#8ba88b] font-bold hover:underline ml-1 not-italic">Join the family</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;