import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, ShieldCheck, 
  X, Loader2, Calendar, BadgeCheck, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authSuccess } from '../redux/authSlice';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  // 1. Fetch Fresh Profile Data on Mount (Exactly like AdminUsers does)
  useEffect(() => {
    const getFreshProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Assuming your backend has a GET /profile route or returns data on login/update
        const { data } = await axios.get(`${API_URL}/api/auth/profile`, config);
        
        // Sync Redux with the freshest data from DB
        dispatch(authSuccess(data)); 
      } catch (error) {
        console.error("Profile sync failed", error);
      } finally {
        setFetching(false);
      }
    };

    if (token) getFreshProfile();
  }, [token, dispatch]);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords match error");
    
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`${API_URL}/api/auth/profile`, { 
        password: passwords.newPassword 
      }, config);
      
      dispatch(authSuccess(data)); 
      toast.success("Security updated successfully!");
      setIsPasswordModalOpen(false);
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
      <Loader2 className="animate-spin text-[#8ba88b]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf8] py-26 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center">
            <div className="h-24 w-24 bg-[#8ba88b]/10 rounded-full flex items-center justify-center text-[#8ba88b] mx-auto mb-4 border-4 border-white shadow-md">
              <User size={40} />
            </div>
            <h2 className="font-serif italic text-2xl text-[#2d3a2d] capitalize">{user?.name}</h2>
            <span className="text-[10px] bg-[#2d3a2d] text-white px-3 py-1 rounded-full uppercase tracking-widest font-bold">
              {user?.role || 'User'}
            </span>
          </div>

          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full bg-[#2d3a2d] text-white p-5 rounded-[2rem] font-serif italic flex items-center justify-center gap-3 hover:bg-[#3d4d3d] transition-all shadow-lg"
          >
            <Lock size={18} /> Change Password
          </button>
        </div>

        {/* Details Section */}
        <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
          <h3 className="font-serif italic text-2xl text-[#2d3a2d] mb-10 flex items-center gap-3">
            <BadgeCheck className="text-[#8ba88b]" /> Registered Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
            <DetailItem label="Full Name" value={user?.name} icon={<User size={16}/>} />
            <DetailItem label="Email Address" value={user?.email} icon={<Mail size={16}/>} isLowercase />
            
            {/* 2. Phone Number - Displaying current state */}
            <DetailItem 
              label="Phone Number" 
              value={user?.phone || 'No phone added'} 
              icon={<Phone size={16}/>} 
            />

            <DetailItem 
              label="Account ID" 
              value={`#${user?._id?.slice(-6)}`} 
              icon={<ShieldCheck size={16}/>} 
            />
          </div>

          <div className="mt-14 pt-8 border-t border-gray-50 flex items-center gap-4 text-gray-400">
            <Calendar size={18} />
            <p className="text-sm italic tracking-wide font-light">Member since August 2025</p>
          </div>
        </div>
      </div>

      {/* Modal logic remains same */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2d3a2d]/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl">
              <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-6 text-gray-400"><X /></button>
              <h2 className="font-serif italic text-2xl text-[#2d3a2d] mb-6">Security Update</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <input 
                  type="password" placeholder="New Password"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-[#8ba88b]"
                  value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                />
                <input 
                  type="password" placeholder="Confirm Password"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border focus:border-[#8ba88b]"
                  value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required
                />
                <button className="w-full bg-[#8ba88b] text-white py-4 rounded-2xl font-serif italic text-lg">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailItem = ({ label, value, icon, isLowercase }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-1.5 flex items-center gap-2">
      {icon} {label}
    </p>
    <p className={`text-lg font-medium text-[#2d3a2d] ${isLowercase ? 'lowercase' : 'capitalize'}`}>
      {value}
    </p>
  </div>
);

export default UserProfile;