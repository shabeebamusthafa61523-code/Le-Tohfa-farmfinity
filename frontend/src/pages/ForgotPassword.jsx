import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Phone, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const preFilledEmail = location.state?.email || '';

  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: preFilledEmail, 
    phone: '', 
    password: '' 
  });

  const handleSimpleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Clean the API URL (Same as Login.jsx)
      const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

      // 2. Use the Aligned Axios configuration
      await axios({
        method: 'post',
        url: `${API_URL}/api/auth/forgot-password`,
        data: {
          email: formData.email,
          phone: formData.phone,
          newPassword: formData.password
        },
        withCredentials: true, // Crucial for CORS handshake
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setIsSuccess(true);
      toast.success("Identity verified! Password updated.");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error("Reset Error:", error);
      if (error.code === "ERR_NETWORK") {
        toast.error("Network Error: Server might be waking up. Please try again.");
      } else {
        toast.error(error.response?.data?.message || "Verification failed. Check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf8] px-4">
      <motion.div layout className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-[#2d3a2d] rounded-2xl flex items-center justify-center text-white mx-auto mb-4 rotate-3">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-serif italic text-3xl text-[#2d3a2d]">Security Hub</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-2 font-bold">
            Account Recovery
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form 
              key="form" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onSubmit={handleSimpleReset} 
              className="space-y-5"
            >
              {/* Email - Allow manual entry if not pre-filled */}
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-[#8ba88b]" size={18} />
                <input 
                  type="email" 
                  placeholder="Registered Email"
                  required
                  className={`w-full p-4 pl-12 rounded-2xl border outline-none transition-all ${
                    preFilledEmail ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-transparent' : 'bg-white border-[#e0e7e0] focus:ring-2 ring-[#8ba88b]/20'
                  }`}
                  value={formData.email} 
                  readOnly={!!preFilledEmail}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Phone Verification */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2d3a2d] ml-2">Verify Registered Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="tel" 
                    placeholder="Enter phone number" 
                    required
                    className="w-full p-4 pl-12 bg-white border border-[#e0e7e0] rounded-2xl outline-none focus:ring-2 ring-[#8ba88b]/20 transition-all"
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2d3a2d] ml-2">Set New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required
                    className="w-full p-4 pl-12 bg-white border border-[#e0e7e0] rounded-2xl outline-none focus:ring-2 ring-[#8ba88b]/20 transition-all"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d3a2d] text-white py-4 rounded-2xl font-serif italic text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-[#3d4d3d] transition-all group disabled:bg-gray-400"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Verify & Reset <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div key="success" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-6">
              <div className="h-20 w-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={40} />
              </div>
              <h3 className="font-serif text-2xl text-[#2d3a2d]">Access Restored</h3>
              <p className="text-gray-400 text-sm mt-2 italic">Redirecting to Login...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;