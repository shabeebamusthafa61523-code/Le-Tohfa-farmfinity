import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserMinus, Loader2, Mail, ShieldAlert, Phone } from 'lucide-react'; // Added Phone icon
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, user: currentUser } = useSelector((state) => state.auth);
  const API_URL = 'http://localhost:5000/api/auth';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_URL}/`, config);
        setUsers(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  const handleDelete = async (userId) => {
    if (userId === currentUser?._id) return toast.error("You cannot remove yourself.");
    if (!window.confirm("Are you sure?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${userId}`, config);
      setUsers(users.filter(u => u._id !== userId));
      toast.success("User removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#8ba88b]" size={40} />
      <p className="text-sm font-serif italic text-[#2d3a2d]/60">fetching guest list...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      <AnimatePresence mode="popLayout">
        {users.map((user) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key={user._id} 
            className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-[#8ba88b]/10 text-[#8ba88b] rounded-full flex items-center justify-center font-serif italic text-xl">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.role === 'admin' && (
                  <div className="absolute -top-1 -right-1 bg-[#2d3a2d] text-white p-1 rounded-full border-2 border-white">
                    <ShieldAlert size={10} />
                  </div>
                )}
              </div>

              <div className="overflow-hidden">
                <h4 className="text-[#2d3a2d] font-medium leading-none mb-2 flex items-center gap-2">
                  {user.name}
                  {user._id === currentUser?._id && <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded-full uppercase">You</span>}
                </h4>
                
                {/* Email Row */}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 italic mb-1">
                   <Mail size={10} className="text-[#8ba88b]/60 shrink-0" />
                   <span className="truncate">{user.email}</span>
                </div>

                {/* Phone Row - Added this section */}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                   <Phone size={10} className="text-[#8ba88b]/60 shrink-0" />
                   <span>{user.phone || 'No phone added'}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleDelete(user._id)}
              disabled={user._id === currentUser?._id}
              className={`p-2.5 rounded-full transition-all ${
                user._id === currentUser?._id ? 'text-gray-100 cursor-not-allowed' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
              }`}
            >
              <UserMinus size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;