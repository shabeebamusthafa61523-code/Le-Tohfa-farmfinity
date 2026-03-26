import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

// ✅ STEP 1: Define FormInput OUTSIDE the main component to prevent focus loss
const FormInput = ({ label, type, id, placeholder, value, icon: Icon, errorField, onChange }) => {
  return (
    <div className="flex flex-col relative group">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-[#4a5d4a] font-black mb-2 ml-1 opacity-70">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5d4a]/40 group-focus-within:text-[#4a5d4a] transition-colors">
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <motion.input
          animate={errorField === id ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          type={type}
          required
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-white border outline-none transition-all text-sm ${
            errorField === id 
              ? 'border-red-400 ring-4 ring-red-50' 
              : 'border-[#e0e7e0] focus:border-[#4a5d4a] focus:ring-4 focus:ring-[#4a5d4a]/5'
          }`}
          placeholder={placeholder}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {errorField === id ? (
            <AlertCircle size={18} className="text-red-400" />
          ) : value.length > (id === 'name' ? 3 : 5) ? (
            <CheckCircle2 size={18} className="text-green-500/30" />
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorField, setErrorField] = useState(null);

  const navigate = useNavigate();
  // Ensure your .env has VITE_API_URL or it defaults to localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errorField === id) setErrorField(null); // Clear error when user types
  };

  const validateForm = () => {
    const { name, email, phone, password } = formData;
    setErrorField(null);

    if (name.trim().length < 3) {
      toast.error("Please enter your full name");
      setErrorField('name');
      return false;
    }

    if (!email.includes('@')) {
      toast.error("Invalid email address");
      setErrorField('email');
      return false;
    }

    if (phone.trim().length < 10) {
      toast.error("Check your number: It should be at least 10 digits");
      setErrorField('phone');
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setErrorField('password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      };

      const { data } = await axios.post(`${API_URL}/api/auth/register`, submissionData);

      if (data) {
        toast.success("Registration successful! Please sign in.");
        // Navigate to login and pre-fill the email
        navigate('/login', { state: { email: submissionData.email,password: formData.password } });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);

      // Indicate error on fields if backend mentions them
      if (msg.toLowerCase().includes('email')) setErrorField('email');
      if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('number')) setErrorField('phone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8faf8]">
      {/* LEFT: FORM SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-md w-full"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif text-[#4a5d4a] mb-3">Create Account</h2>
            <p className="text-gray-400 font-light text-sm italic">Join the Le'Tohfa collection.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput 
                label="Full Name" type="text" id="name" placeholder="John Doe" 
                value={formData.name} icon={User} errorField={errorField} onChange={handleInputChange} 
              />
              <FormInput 
                label="Phone" type="tel" id="phone" placeholder="+91..." 
                value={formData.phone} icon={Phone} errorField={errorField} onChange={handleInputChange} 
              />
            </div>
            
            <FormInput 
              label="Email Address" type="email" id="email" placeholder="john@example.com" 
              value={formData.email} icon={Mail} errorField={errorField} onChange={handleInputChange} 
            />
            <FormInput 
              label="Password" type="password" id="password" placeholder="••••••••" 
              value={formData.password} icon={Lock} errorField={errorField} onChange={handleInputChange} 
            />

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
                loading ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-[#4a5d4a] text-white hover:bg-[#3d4d3d] hover:shadow-xl shadow-[#4a5d4a]/20'
              }`}
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Registering..." : "Register Now"}
            </button>
          </form>

          <p className="mt-10 text-center text-gray-400 text-sm">
            Already registered? 
            <Link to="/login" className="text-[#4a5d4a] font-bold hover:underline ml-2">Sign In</Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT: DECORATIVE IMAGE SECTION */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2d3a2d] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="relative z-10 text-center text-white px-20">
          <span className="text-[10px] tracking-[0.8em] uppercase mb-6 block opacity-50">Le'Tohfa Premium</span>
          <h2 className="text-6xl font-serif italic leading-tight mb-6">Designed for <br/> your comfort.</h2>
          <div className="w-12 h-[1px] bg-white/20 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;