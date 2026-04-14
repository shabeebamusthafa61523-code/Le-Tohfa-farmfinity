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
    <div className="grid lg:grid-cols-12 gap-0 bg-[#f8f7f4] border border-[#2d3a2d]/10 overflow-hidden shadow-2xl">
      
      {/* --- CUSTOM CALENDAR SECTION --- */}
      <div className="lg:col-span-7 p-8 md:p-12 bg-white">
        <div className="flex justify-between items-start mb-12">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#8ba88b] font-bold block mb-2">Availability</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#2d3a2d] leading-none">
              Select <span className="italic font-light">Dates</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4 border-b border-[#2d3a2d]/10 pb-2">
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:text-[#8ba88b] transition-colors"><ChevronLeft size={18}/></button>
             <span className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#2d3a2d] min-w-[120px] text-center">
               {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </span>
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:text-[#8ba88b] transition-colors"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 shadow-sm">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="bg-white py-4 text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
          
          {Array(adjustedFirstDay).fill(0).map((_, i) => <div key={`empty-${i}`} className="bg-[#fcfcfb]" />)}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getTileStatus(day);
            const isSelected = status === "selected";
            const isBooked = status === "booked";
            const isPast = status === "past";

            return (
              <motion.button
                key={day}
                whileHover={!isBooked && !isPast ? { backgroundColor: "#f8f7f4" } : {}}
                disabled={isBooked || isPast}
                onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                className={`
                  h-20 md:h-28 w-full flex flex-col items-center justify-center transition-all relative
                  ${isSelected ? 'bg-[#2d3a2d] text-white z-10' : 'bg-white text-[#2d3a2d]'}
                  ${isBooked ? 'bg-[#f8f7f4] text-gray-300 cursor-not-allowed' : ''}
                  ${isPast ? 'text-gray-100 cursor-not-allowed bg-white' : ''}
                `}
              >
                <span className={`text-xl ${isSelected ? 'font-serif italic scale-125' : 'font-light'}`}>{day}</span>
                {isBooked && <span className="absolute bottom-2 text-[7px] font-bold uppercase tracking-tighter opacity-40">Occupied</span>}
                {isSelected && <motion.div layoutId="underline" className="absolute bottom-4 w-1 h-1 bg-[#8ba88b] rounded-full" />}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-10 flex gap-8 items-center justify-center lg:justify-start opacity-60">
           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest"><div className="w-2 h-2 bg-[#2d3a2d]"/> Selected</div>
           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest"><div className="w-2 h-2 bg-gray-100 border border-gray-200"/> Available</div>
           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-300"><div className="w-2 h-2 bg-[#f8f7f4]"/> Booked</div>
        </div>
      </div>

      {/* --- SUMMARY CARD SECTION --- */}
      <div className="lg:col-span-5 p-8 md:p-12 bg-[#2d3a2d] text-white flex flex-col justify-between">
        <div className="space-y-12">
          <header className="border-b border-white/10 pb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#8ba88b] block mb-4">Reservation Details</span>
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-serif italic font-light">{activePlan}</h3>
              <div className="opacity-40">
                {activePlan === "Staycation" ? <CalIcon size={32} strokeWidth={1}/> : <Clock size={32} strokeWidth={1}/>}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
            <div className="p-6 bg-[#2d3a2d]">
              <p className="text-[9px] font-bold text-[#8ba88b] uppercase tracking-[0.2em] mb-2">Arrival</p>
              <p className="text-lg font-serif">{selectedDate.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</p>
              <p className="text-[10px] opacity-50 uppercase">{currentPlan.in}</p>
            </div>
            <div className="p-6 bg-[#2d3a2d] border-l border-white/10">
              <p className="text-[9px] font-bold text-[#8ba88b] uppercase tracking-[0.2em] mb-2">Departure</p>
              <p className="text-lg font-serif">{checkOutDate.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</p>
              <p className="text-[10px] opacity-50 uppercase">{currentPlan.out}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8ba88b]">Total Guests</span>
              <span className="text-2xl font-serif">{guestCount}</span>
            </div>
            <input 
              type="range" min="1" max={Number(currentPlan.maxGuests) + 20} 
              value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} 
              className="w-full h-px bg-white/20 appearance-none accent-[#8ba88b] cursor-pointer" 
            />
          </div>
        </div>

        <div className="mt-16 space-y-8">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.5em] opacity-40 mb-2">Estimated Investment</p>
            <div className="text-6xl font-serif">₹{totalPrice.toLocaleString('en-IN')}</div>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={handleConfirmNow}
              className="w-full bg-[#8ba88b] text-[#2d3a2d] py-6 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4"
            >
              Confirm Reservation <ArrowRight size={16} />
            </button>

            <button 
              onClick={handleWhatsApp}
              className="w-full bg-transparent border border-white/20 text-white py-5 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
            >
              <MessageCircle size={16} className="text-[#8ba88b]"/> 
              Inquire via Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;