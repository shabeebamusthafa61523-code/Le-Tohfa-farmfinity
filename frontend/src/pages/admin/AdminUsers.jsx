import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserMinus, Loader2, Mail, ShieldAlert, Phone, 
  Users, Search, UserCheck 
} from 'lucide-react'; 
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { token, user: currentUser } = useSelector((state) => state.auth);
  // Ensure this points to your USER LIST endpoint
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Adjusted endpoint to standard /api/users or /api/auth/all-users
        const { data } = await axios.get(`${API_URL}/api/auth`, config);
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load guest list");
        setUsers([]); 
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token, API_URL]);

  const handleDelete = async (userId) => {
    if (userId === currentUser?._id) return toast.error("Security: You cannot remove your own account.");
    
    if (!window.confirm("This will permanently remove this user's access. Continue?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/api/auth/users/${userId}`, config);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success("Access revoked successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#8ba88b]" size={40} />
      <p className="text-sm font-serif italic text-[#2d3a2d]/60">Authenticating guest list...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="font-serif italic text-3xl text-[#2d3a2d]">User Accounts</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Manage system access</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#8ba88b]/20 transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isSelf = user._id === currentUser?._id;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={user._id} 
                  className={`p-6 bg-white border rounded-[2.5rem] flex items-center justify-between transition-all group shadow-sm hover:shadow-md ${isSelf ? 'border-[#8ba88b]/30' : 'border-gray-50'}`}
                >
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-serif italic text-xl ${isSelf ? 'bg-[#2d3a2d] text-white' : 'bg-[#8ba88b]/10 text-[#8ba88b]'}`}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      {user.role === 'admin' && (
                        <div className="absolute -top-1 -right-1 bg-[#8ba88b] text-white p-1 rounded-full border-2 border-white shadow-sm">
                          <UserCheck size={10} />
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-[#2d3a2d] font-bold truncate flex items-center gap-2">
                        {user.name}
                        {isSelf && (
                          <span className="text-[7px] bg-[#8ba88b]/10 text-[#8ba88b] px-2 py-0.5 rounded-full uppercase tracking-tighter">Active Now</span>
                        )}
                      </h4>
                      
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <Mail size={10} className="shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                          <Phone size={10} className="shrink-0 text-[#8ba88b]/60" />
                          <span>{user.phone || 'No contact linked'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!isSelf && (
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="p-3 rounded-2xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Revoke Access"
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center opacity-20">
              <Users size={48} />
              <p className="font-serif italic text-lg mt-2">No users found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminUsers;