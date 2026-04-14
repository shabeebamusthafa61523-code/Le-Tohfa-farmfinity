import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Calendar as CalIcon, Clock, ArrowRight, 
  ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PLAN_SETTINGS = {
  Staycation: { base: 15000, maxGuests: 20, extra: 200, in: "15:00", out: "12:00", nextDay: true },
  Daycation: { base: 15000, maxGuests: 20, extra: 100, in: "09:00", out: "21:00", nextDay: false },
  Event: { base: 25000, maxGuests: 200, extra: 0, in: "10:00", out: "23:00", nextDay: false }
};

const BookingCalendar = ({ activePlan = "Staycation", settings }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [guestCount, setGuestCount] = useState(20);
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const todayStr = new Date().toLocaleDateString('en-CA');

  // 1. Resolve Plan Settings
  const currentPlan = useMemo(() => {
    return settings?.plans?.[activePlan] || DEFAULT_PLAN_SETTINGS[activePlan];
  }, [settings, activePlan]);

  // 2. Fetch Occupied Dates
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/bookings`);
        setBookings(Array.isArray(data) ? data : (data.allBookings || []));
      } catch (err) {
        console.error("Calendar Sync Error:", err);
      }
    };
    fetchBookings();
  }, [API_URL]);

  // 3. Calendar Grid Helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Start from Monday

 const getTileStatus = (day) => {
  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
  const dateStr = date.toLocaleDateString('en-CA');
  
  if (dateStr < todayStr) return "past";

  const isConflict = bookings.some(b => {
    const bCheckInStr = b.checkIn.split('T')[0];
    const bCheckOutStr = b.checkOut.split('T')[0];
    const bPlan = b.plan;

    // 1. DIRECT BLOCK: If a booking starts on this exact day
    if (bCheckInStr === dateStr) return true;

    // 2. STAYCATION CHECK-OUT BLOCK: 
    // If we are looking at a Daycation/Event, we MUST block the date 
    // if a Staycation is checking out today (because they stay until 12 PM).
    if (activePlan !== 'Staycation') {
      if (bCheckOutStr === dateStr && bPlan === 'Staycation') return true;
    }

    // 3. STAYCATION CHECK-IN BLOCK:
    // If we are looking at a Staycation, we MUST block today 
    // if a Daycation or Event is already happening today.
    if (activePlan === 'Staycation') {
      if (bCheckInStr === dateStr && (bPlan === 'Daycation' || bPlan === 'Event')) return true;
      
      // Also block today if a Daycation/Event is booked for TOMORROW
      // (Because Staycation checkout is 12 PM tomorrow, clashing with 9 AM start)
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
      if (bCheckInStr === tomorrowStr && (bPlan === 'Daycation' || bPlan === 'Event')) return true;
    }

    return false;
  });

  if (isConflict) return "booked";
  if (selectedDate.toLocaleDateString('en-CA') === dateStr) return "selected";
  return "available";
}; 

  // 4. Calculations
  const totalPrice = useMemo(() => {
    const { base, maxGuests, extra } = currentPlan;
    return guestCount <= maxGuests ? base : base + (guestCount - maxGuests) * extra;
  }, [guestCount, currentPlan]);

  const checkOutDate = useMemo(() => {
    const d = new Date(selectedDate);
    if (currentPlan.nextDay) d.setDate(d.getDate() + 1);
    return d;
  }, [selectedDate, currentPlan]);

  // 5. Actions
  const handleConfirmNow = () => {
    const savedUser = localStorage.getItem('userInfo');
    const userInfo = savedUser ? JSON.parse(savedUser) : null;
    
    const formData = {
      guestName: userInfo?.name || "Guest",
      guestPhone: userInfo?.phone || "N/A",
      plan: activePlan,
      checkIn: new Date(`${selectedDate.toLocaleDateString('en-CA')}T${currentPlan.in}`),
      checkOut: new Date(`${checkOutDate.toLocaleDateString('en-CA')}T${currentPlan.out}`),
      totalPrice,
      guestCount,
      advanceAmount: settings?.advanceAmount || 5000 
    };
    navigate('/checkout', { state: { formData } });
  };

  const handleWhatsApp = () => {
    const whatsappNum = (settings?.whatsappNumber || "919562042711").replace(/\D/g, '');
    const message = `Hello! I'd like to book a ${activePlan} on ${selectedDate.toLocaleDateString('en-GB')}. Guests: ${guestCount}. Total: ₹${totalPrice.toLocaleString('en-IN')}`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

 return (
    <div className="grid lg:grid-cols-12 gap-8 p-4 bg-white/50 rounded-[3rem] backdrop-blur-md border border-white/20">
      
      {/* --- CUSTOM CALENDAR SECTION --- */}
      <div className="lg:col-span-7">
        <div className="flex justify-between items-end mb-8 px-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif italic text-[#2d3a2d]">Select Date</h2>
            <p className="text-gray-400 text-sm">Availability for {activePlan}</p>
          </div>
          <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
             <span className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-[#2d3a2d]">
               {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
             </span>
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-300 uppercase mb-2">{d}</div>
          ))}
          
          {/* Empty slots for start of month */}
          {Array(adjustedFirstDay).fill(0).map((_, i) => <div key={`empty-${i}`} />)}

          {/* Actual Day Tiles */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getTileStatus(day);
            const isSelected = status === "selected";
            const isBooked = status === "booked";
            const isPast = status === "past";

            return (
              <motion.button
                key={day}
                whileHover={!isBooked && !isPast ? { y: -2, scale: 1.02 } : {}}
                whileTap={!isBooked && !isPast ? { scale: 0.95 } : {}}
                disabled={isBooked || isPast}
                onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                className={`
                  h-14 md:h-20 w-full rounded-2xl flex flex-col items-center justify-center transition-all relative overflow-hidden border
                  ${isSelected ? 'bg-[#2d3a2d] text-white shadow-xl ring-4 ring-[#2d3a2d]/10 border-[#2d3a2d]' : ''}
                  ${isBooked ? 'bg-red-100 text-red-600 cursor-not-allowed border-red-200 shadow-sm' : ''}
                  ${isPast ? 'text-gray-200 cursor-not-allowed border-transparent bg-transparent' : ''}
                  ${status === 'available' ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-800' : ''}
                `}
              >
                <span className={`text-lg font-bold ${isSelected ? 'font-serif italic' : ''}`}>{day}</span>
                {isBooked && (
                  <span className="text-[7px] font-black uppercase tracking-tighter text-red-500/80 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> Reserved
                  </span>
                )}
                {status === 'available' && !isSelected && (
                   <span className="w-1 h-1 bg-emerald-400 rounded-full mt-1" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex gap-6 px-4 py-4 border-t border-gray-100 justify-center md:justify-start">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200"/> Available</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><div className="w-3 h-3 rounded-full bg-[#2d3a2d]"/> Selected</div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><div className="w-3 h-3 rounded-full bg-red-200 border border-red-300"/> Booked</div>
        </div>
      </div>

      {/* --- SUMMARY CARD SECTION --- */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-[#2d3a2d]/5 space-y-6 sticky top-8 border border-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8ba88b] block mb-1">Your Stay</span>
              <h3 className="text-3xl font-serif italic text-[#2d3a2d]">{activePlan}</h3>
            </div>
            <div className="bg-[#f4f7f4] p-4 rounded-2xl text-[#8ba88b]">
              {activePlan === "Staycation" ? <CalIcon size={24}/> : <Clock size={24}/>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50/80 p-6 rounded-3xl border border-gray-100">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entry</p>
              <p className="text-sm font-bold text-[#2d3a2d]">{selectedDate.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</p>
              <p className="text-[10px] text-gray-400">{currentPlan.in}</p>
            </div>
            <div className="text-right border-l border-gray-200 pl-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Exit</p>
              <p className="text-sm font-bold text-[#2d3a2d]">{checkOutDate.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</p>
              <p className="text-[10px] text-gray-400">{currentPlan.out}</p>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-[#2d3a2d] uppercase tracking-wider">Total Guests</span>
              <span className="bg-[#2d3a2d] text-white px-4 py-1 rounded-full text-[11px] font-bold">{guestCount}</span>
            </div>
            <input 
              type="range" min="1" max={Number(currentPlan.maxGuests) + 20} 
              value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} 
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-[#8ba88b] cursor-pointer" 
            />
          </div>

          <div className="bg-[#2d3a2d] p-8 rounded-[2rem] text-center text-white shadow-xl relative overflow-hidden">
            <Sparkles className="absolute top-2 right-4 opacity-10" size={40} />
            <p className="text-[9px] uppercase opacity-40 tracking-[0.3em] mb-1">Experience Total</p>
            <div className="text-4xl font-serif italic">₹{totalPrice.toLocaleString('en-IN')}</div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={handleConfirmNow}
              className="w-full bg-[#8ba88b] text-white py-5 rounded-2xl font-serif italic text-xl flex items-center justify-center gap-3 hover:bg-[#7a997a] transition-all shadow-lg active:scale-95"
            >
              Confirm Booking <ArrowRight size={20} />
            </button>

            <button 
              onClick={handleWhatsApp}
              className="w-full bg-white border border-gray-100 text-[#2d3a2d] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
            >
              <MessageCircle size={18} className="text-green-500"/> 
              <span className="text-sm uppercase tracking-widest text-[10px]">Inquire Availability</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;