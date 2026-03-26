import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import { MessageCircle, Calendar as CalIcon, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import "./BookingCalendar.css";

// Fallback settings in case the admin settings fail to load or are empty
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

  // 1. Resolve Plan Settings (Admin Data > Default Fallback)
  const currentPlan = useMemo(() => {
    if (settings?.plans && settings.plans[activePlan]) {
      return settings.plans[activePlan];
    }
    return DEFAULT_PLAN_SETTINGS[activePlan];
  }, [settings, activePlan]);

  // 2. Fetch Occupied Dates
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token;
        if (!token) return;

        const { data } = await axios.get('http://localhost:5000/api/bookings/booked-dates', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(Array.isArray(data) ? data : data.allBookings || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchBookings();
  }, []);

  // 3. Tile Status Logic (Handles overlapping Check-ins/Outs)
  const getTileStatus = (dateObj) => {
    const dateStr = dateObj.toLocaleDateString('en-CA');
    const potIn = new Date(`${dateStr}T${currentPlan.in}`);
    let outD = new Date(potIn);
    if (currentPlan.nextDay) outD.setDate(outD.getDate() + 1);
    const potOut = new Date(`${outD.toLocaleDateString('en-CA')}T${currentPlan.out}`);

    const conflict = bookings.find(b => {
      const exIn = new Date(b.checkIn);
      const exOut = new Date(b.checkOut);
      return potIn < exOut && potOut > exIn;
    });

    if (!conflict) return "available-tile";
    if (conflict.guestName === "ADMIN BLOCK") return "blocked-tile booked-tile";
    return `${conflict.plan?.toLowerCase() || 'staycation'}-booked booked-tile`;
  };

  // 4. Dynamic Pricing Calculation
  const totalPrice = useMemo(() => {
    const { base, maxGuests, extra } = currentPlan;
    const basePrice = Number(base);
    const extraPrice = Number(extra);
    return guestCount <= maxGuests ? basePrice : basePrice + (guestCount - maxGuests) * extraPrice;
  }, [guestCount, currentPlan]);

  const checkOutDate = useMemo(() => {
    const d = new Date(selectedDate);
    if (currentPlan.nextDay) d.setDate(d.getDate() + 1);
    return d;
  }, [selectedDate, currentPlan]);

  // 5. Navigation to Checkout
  const handleConfirmNow = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    const formData = {
      guestName: userInfo?.name || "Guest",
      guestPhone: userInfo?.phone || "N/A",
      plan: activePlan,
      checkIn: new Date(`${selectedDate.toLocaleDateString('en-CA')}T${currentPlan.in}`),
      checkOut: new Date(`${checkOutDate.toLocaleDateString('en-CA')}T${currentPlan.out}`),
      totalPrice: totalPrice,
      guestCount: guestCount,
      advanceAmount: settings?.advanceAmount || 5000 // Sync advance from admin
    };

    navigate('/checkout', { state: { formData } });
  };

  // 6. DYNAMIC WHATSAPP REDIRECT
  const handleWhatsApp = () => {
    // Uses the number saved in Admin Settings
    const whatsappNum = settings?.whatsappNumber || "918590653062"; 
    const message = `Hello! I'd like to book a ${activePlan} on ${selectedDate.toLocaleDateString('en-GB')}. Guests: ${guestCount}. Total: ₹${totalPrice.toLocaleString()}`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 p-4 bg-white/50 rounded-[3rem]">
      {/* Calendar Section */}
      <div className="lg:col-span-7">
        <h2 className="text-4xl font-serif italic text-[#2d3a2d] mb-2">Check Availability</h2>
        <p className="text-gray-400 text-sm mb-6">Real-time availability for {activePlan} stays.</p>
        
        <div className="premium-calendar-v2">
          <Calendar 
            onChange={setSelectedDate} 
            value={selectedDate}
            minDate={new Date()}
            tileDisabled={({date}) => getTileStatus(date).includes('booked-tile')}
            tileClassName={({date}) => getTileStatus(date)}
          />
          
          <div className="legend-bar mt-6 flex flex-wrap gap-4">
            <div className="legend-item"><div className="dot bg-[#e6f7eb] border border-[#dcfce7]"/> Available</div>
            <div className="legend-item"><div className="dot bg-[#343d33]"/> Selected</div>
            <div className="legend-item"><div className="dot bg-red-100 border border-red-200"/> Blocked</div>
          </div>
        </div>
      </div>

      {/* Summary Card Section */}
      <div className="lg:col-span-5 pt-4">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 space-y-6 relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8ba88b] block mb-1">Experience</span>
              <h3 className="text-2xl font-serif italic text-[#2d3a2d]">{activePlan}</h3>
            </div>
            <div className="bg-[#f4f7f4] p-3 rounded-2xl">
              {activePlan === "Staycation" ? <CalIcon className="text-[#8ba88b]" size={20}/> : 
               activePlan === "Daycation" ? <Clock className="text-[#8ba88b]" size={20}/> : 
               <MessageCircle className="text-[#8ba88b]" size={20}/>}
            </div>
          </div>

          <div className="space-y-3 bg-gray-50/50 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Check-In</span>
              <span className="text-[#2d3a2d] font-sans">{selectedDate.toLocaleDateString('en-GB')} • {currentPlan.in}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Check-Out</span>
              <span className="text-[#2d3a2d] font-sans">{checkOutDate.toLocaleDateString('en-GB')} • {currentPlan.out}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="font-bold text-sm text-[#2d3a2d]">Total Guests</span>
              <span className="bg-[#2d3a2d] text-white px-3 py-1 rounded-full text-[10px] font-bold">{guestCount} Guests</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max={Number(currentPlan.maxGuests) + 20} 
              value={guestCount} 
              onChange={e => setGuestCount(Number(e.target.value))} 
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none accent-[#2d3a2d]" 
            />
          </div>

          <div className="bg-[#2d3a2d] p-8 rounded-[2rem] text-center text-white relative shadow-inner">
            <p className="text-[9px] uppercase opacity-40 tracking-[0.3em] mb-1">Estimated Total</p>
            <div className="text-4xl font-serif italic tracking-tight">₹{totalPrice.toLocaleString()}</div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={handleConfirmNow}
              className="group w-full bg-[#8ba88b] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#7a997a] transition-all shadow-lg active:scale-95"
            >
              <span className="font-serif italic text-xl">Confirm Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleWhatsApp}
              className="w-full bg-white border border-green-400 text-[#2d3a2d] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
            >
              <MessageCircle size={18} className="text-green-500"/> 
              <span className="text-sm">Inquire on WhatsApp</span>
            </button>
          </div>

          <p className="text-[9px] text-center text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck size={12}/> Instant confirmation & Secure Payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;