import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Smartphone, Loader2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const preFilledEmail = location.state?.email || '';

  const [step, setStep] = useState(1); // 1: Email Request, 2: OTP Verification, 3: Success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: preFilledEmail, 
    otp: '', 
    password: '' 
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // STEP 1: Request OTP from Backend
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calling your new backend route
      await axios.post(`${API_URL}/api/auth/send-otp`, { email: formData.email });
      
      setStep(2);
      toast.success("Verification code sent to your email!", { icon: '📧' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send OTP. Check your email.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and Reset Password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calling your reset route that validates the OTP in DB
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.password
      });
      
      setStep(3);
      toast.success("Password reset successful!");
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf8] px-4 selection:bg-[#8ba88b]/30">
      <motion.div layout className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="h-14 w-14 bg-[#2d3a2d] rounded-2xl flex items-center justify-center text-white mx-auto mb-4 rotate-3">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-serif italic text-3xl text-[#2d3a2d]">Security Hub</h2>
          <p className="text-gray-400 text-xs mt-2 tracking-wide uppercase">
            {step === 1 ? 'Step 01: Identification' : step === 2 ? 'Step 02: Verification' : 'Access Restored'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleRequestOTP} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2d3a2d] ml-2">Registered Email</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-4 ${preFilledEmail ? 'text-[#8ba88b]' : 'text-gray-300'}`} size={18} />
                  <input 
                    type="email" placeholder="email@letohfa.com" required
                    readOnly={!!preFilledEmail}
                    className={`w-full p-4 pl-12 rounded-2xl outline-none border transition-all ${
                      preFilledEmail 
                        ? 'bg-gray-50 text-gray-500 border-transparent italic' 
                        : 'bg-white border-[#e0e7e0] focus:ring-2 ring-[#8ba88b]/20'
                    }`}
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <button className="w-full bg-[#2d3a2d] text-white py-4 rounded-2xl font-serif italic text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-[#3d4d3d] transition-all">
                {loading ? <Loader2 className="animate-spin" /> : "Request Verification Code"}
              </button>
            </motion.form>
          ) : step === 2 ? (
            <motion.form key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleVerifyAndReset} className="space-y-6">
              <div className="p-4 bg-[#8ba88b]/5 rounded-2xl border border-[#8ba88b]/10 text-center mb-2">
                <p className="text-[10px] uppercase font-bold text-[#8ba88b] tracking-widest">Check your inbox</p>
                <p className="text-xs text-gray-400 mt-1 italic font-light">Enter the 4-digit code sent to your email.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="text" placeholder="Verification Code" required maxLength="4"
                    className="w-full p-4 pl-12 bg-white border border-[#e0e7e0] rounded-2xl outline-none focus:ring-2 ring-[#8ba88b]/20 tracking-[1em] font-bold text-center"
                    value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="password" placeholder="New Strong Password" required
                    className="w-full p-4 pl-12 bg-white border border-[#e0e7e0] rounded-2xl outline-none focus:ring-2 ring-[#8ba88b]/20"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button className="w-full bg-[#8ba88b] text-white py-4 rounded-2xl font-serif italic text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                {loading ? <Loader2 className="animate-spin" /> : "Verify & Reset Access"}
              </button>
            </motion.form>
          ) : (
            <motion.div key="s3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
              <div className="h-20 w-20 bg-[#8ba88b]/10 text-[#8ba88b] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={40} />
              </div>
              <h3 className="font-serif text-2xl text-[#2d3a2d]">Account Restored</h3>
              <p className="text-gray-400 text-sm mt-2 italic">Redirecting you to the login experience...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;