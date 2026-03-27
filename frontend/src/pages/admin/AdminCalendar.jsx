import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  HardHat, Loader2, LogOut, Calendar as CalendarIcon 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { token } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Re-fetch when month/year changes
  useEffect(() => { 
    fetchSchedule(); 
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Ensure this matches your main bookings endpoint
      const { data } = await axios.get(`${API_URL}/api/bookings`, config);
      setBookings(Array.isArray(data) ? data : (data.bookings || [])); 
    } catch (error) { 
      toast.error("Sync error"); 
      setBookings([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  
  // Adjusted for Monday start (0=Sun, 1=Mon... 6=Sat)
  const getFirstDayPos = () => {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handleDateAction = async (dateStr, type) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Safety check for unblocking
    if (type === 'unblock' && !window.confirm("Release this date for bookings?")) return;

    setActionLoading(true);
    try {
      if (type === 'block') {
        await axios.post(`${API_URL}/api/bookings/block-date`, { date: dateStr }, config);
        toast.success("Date Locked");
      } else {
        // Find the specific ADMIN BLOCK entry for this date to get its ID
        const blockEntry = bookings.find(b => 
          b.guestName === "ADMIN BLOCK" && b.checkIn.startsWith(dateStr)
        );
        
        if (blockEntry) {
          await axios.delete(`${API_URL}/api/bookings/${blockEntry._id}`, config);
          toast.success("Date Released");
        } else {
          toast.error("Block record not found");
        }
      }
      fetchSchedule(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const changeDate = (offset, unit) => {
    const newDate = new Date(currentDate);
    if (unit === 'month') newDate.setMonth(currentDate.getMonth() + offset);
    if (unit === 'year') newDate.setFullYear(currentDate.getFullYear() + offset);
    setCurrentDate(newDate);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 md:p-12 min-h-screen bg-[#f8f9f8] flex flex-col items-center">
      <AnimatePresence>
        {actionLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-sm flex items-center justify-center"
          >
            <Loader2 className="animate-spin text-[#2d3a2d]" size={32} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] p-8 md:p-16 shadow-lg border border-gray-50">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-4 text-[#2d3a2d]/40">
            <button onClick={() => changeDate(-1, 'year')} className="hover:text-[#2d3a2d] transition-colors"><ChevronsLeft size={18}/></button>
            <button onClick={() => changeDate(-1, 'month')} className="hover:text-[#2d3a2d] transition-colors"><ChevronLeft size={18}/></button>
          </div>
          
          <div className="text-center">
            <h1 className="font-serif italic text-3xl text-[#2d3a2d]">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#8ba88b] font-bold mt-1">Availability Manager</p>
          </div>

          <div className="flex gap-4 text-[#2d3a2d]/40">
            <button onClick={() => changeDate(1, 'month')} className="hover:text-[#2d3a2d] transition-colors"><ChevronRight size={18}/></button>
            <button onClick={() => changeDate(1, 'year')} className="hover:text-[#2d3a2d] transition-colors"><ChevronsRight size={18}/></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2 md:gap-y-4">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-[#8ba88b]/60 pb-4">{day}</div>
          ))}

          {/* Empty cells for start of month */}
          {Array.from({ length: getFirstDayPos() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 md:h-20"></div>
          ))}
          
          {/* Day Cells */}
          {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const isToday = dateStr === todayStr;
            const guestIn = bookings.find(b => b.checkIn?.startsWith(dateStr) && b.guestName !== "ADMIN BLOCK");
            const guestOut = bookings.find(b => b.checkOut?.startsWith(dateStr) && b.guestName !== "ADMIN BLOCK");
            
            // Check if blocked by admin
            const adminBlock = bookings.find(b => 
              b.guestName === "ADMIN BLOCK" && 
              (b.checkIn?.startsWith(dateStr) || b.checkOut?.startsWith(dateStr))
            );

            return (
              <div key={day} className="flex flex-col items-center justify-center relative group">
                <button 
                  disabled={guestIn && !adminBlock} // Can't block if a real guest is there
                  onClick={() => handleDateAction(dateStr, adminBlock ? 'unblock' : 'block')}
                  className={`
                    w-12 h-12 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center transition-all relative
                    ${guestIn ? 'bg-[#2d3a2d] text-white cursor-default' : 
                      adminBlock ? 'bg-red-400 text-white hover:bg-red-500' : 
                      'hover:bg-[#8ba88b]/10 text-[#2d3a2d]/60'}
                    ${isToday && !guestIn && !adminBlock ? 'ring-2 ring-[#8ba88b] ring-offset-2' : ''}
                  `}
                >
                  <span className={`text-sm font-bold ${guestIn || adminBlock ? 'opacity-100' : 'opacity-60'}`}>{day}</span>
                  
                  {/* Status Icons */}
                  {guestOut && !guestIn && (
                    <div className="absolute -top-1 -right-1 bg-[#8ba88b] text-white p-1 rounded-full border-2 border-white">
                      <LogOut size={8} />
                    </div>
                  )}
                  {adminBlock && (
                    <div className="absolute -bottom-1 -right-1 bg-white text-red-400 p-1 rounded-full shadow-sm border border-red-50">
                      <HardHat size={10} />
                    </div>
                  )}
                </button>
                
                {/* Hover Tooltip for Guest Name */}
                {guestIn && (
                   <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-[#2d3a2d] text-white text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                     {guestIn.guestName}
                   </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-16 pt-8 border-t border-gray-50 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2d3a2d]" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-gray-200" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full ring-1 ring-[#8ba88b]" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;