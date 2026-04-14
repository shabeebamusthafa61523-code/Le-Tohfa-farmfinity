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
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-[#fdfdfd]">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        
        {/* --- FLOATING CALENDAR SECTION --- */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 shadow-[0_32px_64px_-16px_rgba(45,58,45,0.08)] border border-gray-100">
          <div className="flex justify-between items-center mb-10 px-2">
            <div>
              <h2 className="text-3xl font-serif text-[#2d3a2d] tracking-tight">Select Date</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8ba88b] font-bold mt-1">Available Residency</p>
            </div>
            
            <div className="flex items-center gap-1 bg-[#f4f7f4] rounded-full p-1.5 border border-[#2d3a2d]/5">
               <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all"><ChevronLeft size={16}/></button>
               <span className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-[#2d3a2d]">
                 {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
               </span>
               <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all"><ChevronRight size={16}/></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-2">{d}</div>
            ))}
            
            {Array(adjustedFirstDay).fill(0).map((_, i) => <div key={`empty-${i}`} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = getTileStatus(day);
              const isSelected = status === "selected";
              const isBooked = status === "booked";
              const isPast = status === "past";

              return (
                <motion.button
                  key={day}
                  whileHover={!isBooked && !isPast ? { scale: 1.05, backgroundColor: "#f4f7f4" } : {}}
                  disabled={isBooked || isPast}
                  onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                  className={`
                    aspect-square w-full rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                    ${isSelected ? 'bg-[#2d3a2d] text-white shadow-2xl shadow-[#2d3a2d]/30 scale-105 z-10' : 'text-[#2d3a2d]'}
                    ${isBooked ? 'bg-gray-50 text-gray-200 cursor-not-allowed border border-dashed border-gray-200' : ''}
                    ${isPast ? 'opacity-20 cursor-not-allowed' : ''}
                    ${status === 'available' ? 'bg-white border border-gray-50' : ''}
                  `}
                >
                  <span className={`text-lg ${isSelected ? 'font-serif italic' : 'font-medium'}`}>{day}</span>
                  {isSelected && <div className="absolute bottom-3 w-1 h-1 bg-[#8ba88b] rounded-full" />}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center gap-8 border-t border-gray-50 pt-8">
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-[#2d3a2d]"/> Selected</div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-gray-200"/> Booked</div>
          </div>
        </div>

        {/* --- FLOATING SUMMARY SECTION --- */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8ba88b] mb-1">Stay Type</p>
                  <h3 className="text-4xl font-serif italic text-[#2d3a2d] leading-none">{activePlan}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#f4f7f4] flex items-center justify-center text-[#8ba88b]">
                  {activePlan === "Staycation" ? <CalIcon size={22}/> : <Clock size={22}/>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-gray-100 rounded-3xl overflow-hidden border border-gray-100">
                <div className="bg-white p-6">
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest block mb-1">Check-In</span>
                  <p className="text-sm font-bold text-[#2d3a2d]">{selectedDate.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</p>
                </div>
                <div className="bg-white p-6 border-l border-gray-100">
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest block mb-1">Check-Out</span>
                  <p className="text-sm font-bold text-[#2d3a2d]">{checkOutDate.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</p>
                </div>
              </div>

              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em]">Occupancy</span>
                  <span className="text-lg font-serif italic text-[#2d3a2d]">{guestCount} Guests</span>
                </div>
                <input 
                  type="range" min="1" max={Number(currentPlan.maxGuests) + 20} 
                  value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} 
                  className="w-full h-1 bg-gray-100 rounded-lg appearance-none accent-[#2d3a2d] cursor-pointer" 
                />
              </div>

              <div className="pt-6 border-t border-gray-50">
                <p className="text-[10px] text-center uppercase tracking-[0.4em] text-gray-300 mb-2">Grand Total</p>
                <div className="text-5xl font-serif text-center text-[#2d3a2d]">₹{totalPrice.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={handleConfirmNow}
              className="w-full bg-[#2d3a2d] text-white py-6 rounded-[1.5rem] font-serif italic text-xl flex items-center justify-center gap-3 hover:bg-[#1a241a] transition-all shadow-xl shadow-[#2d3a2d]/20 active:scale-95"
            >
              Confirm Reservation <ArrowRight size={20} />
            </button>

            <button 
              onClick={handleWhatsApp}
              className="w-full bg-white border border-gray-100 text-[#2d3a2d] py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
            >
              <MessageCircle size={18} className="text-green-500"/> 
              WhatsApp Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;