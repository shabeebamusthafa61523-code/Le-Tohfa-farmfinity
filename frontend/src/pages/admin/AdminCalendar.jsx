import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, HardHat, Loader2, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { token } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/bookings";

  useEffect(() => { fetchSchedule(); }, [currentDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(API_URL, config);
      setBookings(data);
    } catch (error) { toast.error("Sync error"); } 
    finally { setLoading(false); }
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

 const handleDateAction = async (dateStr, type) => {
  // Ensure dateStr is a string like "2026-03-20"
  const config = { headers: { Authorization: `Bearer ${token}` } };
  setActionLoading(true);

  try {
    if (type === 'block') {
      // Direct string send
      await axios.post(`${API_URL}/block-date`, { date: dateStr }, config);
      toast.success("Date Locked");
    } else {
      // Find the specific block to delete it
      const blockEntry = bookings.find(b => 
        b.checkIn.includes(dateStr) && b.guestName === "ADMIN BLOCK"
      );
      if (blockEntry) await axios.delete(`${API_URL}/${blockEntry._id}`, config);
      toast.success("Date Released");
    }
    fetchSchedule(); 
  } catch (err) {
    toast.error(err.response?.data?.message || "Action failed");
  } finally {
    setActionLoading(false);
  }
};
  return (
    <div className="p-4 md:p-12 min-h-screen bg-[#f8f9f8] flex flex-col items-center">
      <AnimatePresence>
        {actionLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-[#2d3a2d]" size={32} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] p-8 md:p-16 shadow-lg border border-gray-50">
        <div className="flex justify-between items-center mb-16">
          <div className="flex gap-4 text-[#2d3a2d]/40">
            <button onClick={() => setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)))}><ChevronsLeft size={18}/></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft size={18}/></button>
          </div>
          <h1 className="font-serif italic text-3xl text-[#2d3a2d]">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
          <div className="flex gap-4 text-[#2d3a2d]/40">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight size={18}/></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setFullYear(currentDate.getFullYear() + 1)))}><ChevronsRight size={18}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
            <div key={`${day}-${idx}`} className="text-center text-[10px] font-bold text-[#8ba88b] border-b border-[#8ba88b]/10 pb-4 mb-4">{day}</div>
          ))}

          {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, i) => <div key={`empty-${i}`} className="h-20"></div>)}
          
          {Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const guestIn = bookings.find(b => b.checkIn.startsWith(dateStr) && b.guestName !== "ADMIN BLOCK");
            const guestOut = bookings.find(b => b.checkOut.startsWith(dateStr) && b.guestName !== "ADMIN BLOCK");
            const isAdminBlocked = bookings.some(b => b.guestName === "ADMIN BLOCK" && dateStr >= b.checkIn.split('T')[0] && dateStr <= b.checkOut.split('T')[0]);

            return (
              <div key={day} className="flex flex-col items-center justify-center relative">
                <button 
                  onClick={() => handleDateAction(dateStr, isAdminBlocked ? 'unblock' : 'block')}
                  className={`w-14 h-14 md:w-20 md:h-18 rounded-[1.5rem] flex flex-col items-center justify-center transition-all ${guestIn ? 'bg-[#2d3a2d] text-white' : isAdminBlocked ? 'bg-[#ff4d4d] text-white' : 'hover:bg-[#f0f4f0] text-[#2d3a2d]/60'}`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {guestOut && !guestIn && <div className="absolute -top-1 -right-1 bg-[#8ba88b] text-white p-1 rounded-full"><LogOut size={8} /></div>}
                  {isAdminBlocked && <div className="absolute -bottom-1 -right-1 bg-white text-[#ff4d4d] p-1 rounded-full shadow-md"><HardHat size={10} /></div>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;