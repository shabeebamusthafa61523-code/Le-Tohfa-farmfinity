import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import { MessageCircle, Calendar as CalIcon, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import "./BookingCalendar.css";

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
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 1. Resolve Plan Settings
  const currentPlan = useMemo(() => {
    if (settings?.plans && settings.plans[activePlan]) {
      return settings.plans[activePlan];
    }
    return DEFAULT_PLAN_SETTINGS[activePlan];
  }, [settings, activePlan]);

  // 2. Fetch Occupied Dates (Fixed Auth Logic)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Try getting token from userInfo OR direct token key
        const savedUser = localStorage.getItem('userInfo');
        const userInfo = savedUser ? JSON.parse(savedUser) : null;
        const token = userInfo?.token || localStorage.getItem('token');

        if (!token || token === 'undefined') {
          console.warn("Calendar: No valid token found, skipping booked-dates fetch.");
          return;
        }

        const { data } = await axios.get(`${API_URL}/api/bookings/booked-dates`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure we handle different backend response structures
        const fetchedData = Array.isArray(data) ? data : (data.allBookings || []);
        setBookings(fetchedData);
      } catch (err) {
        console.error("Calendar Sync Error:", err);
      }
    };
    fetchBookings();
  }, [API_URL]);

  // 3. Tile Status Logic
  const getTileStatus = (dateObj) => {
    const dateStr = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD
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

  // 4. Calculations
  const totalPrice = useMemo(() => {
    const base = Number(currentPlan.base) || 0;
    const maxGuests = Number(currentPlan.maxGuests) || 0;
    const extra = Number(currentPlan.extra) || 0;
    return guestCount <= maxGuests ? base : base + (guestCount - maxGuests) * extra;
  }, [guestCount, currentPlan]);

  const checkOutDate = useMemo(() => {
    const d = new Date(selectedDate);
    if (currentPlan.nextDay) d.setDate(d.getDate() + 1);
    return d;
  }, [selectedDate, currentPlan]);

  // 5. Checkout Navigation
  const handleConfirmNow = () => {
    const savedUser = localStorage.getItem('userInfo');
    const userInfo = savedUser ? JSON.parse(savedUser) : null;
    
    const formData = {
      guestName: userInfo?.name || "Guest",
      guestPhone: userInfo?.phone || "N/A",
      plan: activePlan,
      checkIn: new Date(`${selectedDate.toLocaleDateString('en-CA')}T${currentPlan.in}`),
      checkOut: new Date(`${checkOutDate.toLocaleDateString('en-CA')}T${currentPlan.out}`),
      totalPrice: totalPrice,
      guestCount: guestCount,
      advanceAmount: settings?.advanceAmount || 5000 
    };

    navigate('/checkout', { state: { formData } });
  };

  const handleWhatsApp = () => {
    const whatsappNum = settings?.whatsappNumber || "918590653062"; 
    const message = `Hello! I'd like to book a ${activePlan} on ${selectedDate.toLocaleDateString('en-GB')}. Guests: ${guestCount}. Total: ₹${totalPrice.toLocaleString('en-IN')}`;
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 p-4 bg-white/50 rounded-[3rem]">
      {/* Calendar Section */}
      <div className="lg:col-span-7">
        <h2 className="text-3xl md:text-4xl font-serif italic text-[#2d3a2d] mb-2">Check Availability</h2>
        <p className="text-gray-400 text-sm mb-6">Real-time availability for {activePlan} stays.</p>
        
        <div className="premium-calendar-v2">
          <Calendar 
            onChange={setSelectedDate} 
            value={selectedDate}
            minDate={new Date()}
            tileDisabled={({date}) => getTileStatus(date).includes('booked-tile')}
            tileClassName={({date}) => getTileStatus(date)}
          />
          
          <div className="legend-bar mt-8 flex flex-wrap gap-6 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 rounded-full bg-[#f4f7f4] border border-gray-100"/> Available
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 rounded-full bg-[#2d3a2d]"/> Selected
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 rounded-full bg-red-50 border border-red-100"/> Blocked
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8ba88b] block mb-1">Reservation</span>
              <h3 className="text-2xl font-serif italic text-[#2d3a2d]">{activePlan}</h3>
            </div>
            <div className="bg-[#f4f7f4] p-3 rounded-2xl text-[#8ba88b]">
              {activePlan === "Staycation" ? <CalIcon size={20}/> : <Clock size={20}/>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-In</p>
              <p className="text-xs font-semibold text-[#2d3a2d]">{selectedDate.toLocaleDateString('en-GB')}</p>
              <p className="text-[10px] text-gray-400">{currentPlan.in}</p>
            </div>
            <div className="text-right border-l border-gray-200 pl-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-Out</p>
              <p className="text-xs font-semibold text-[#2d3a2d]">{checkOutDate.toLocaleDateString('en-GB')}</p>
              <p className="text-[10px] text-gray-400">{currentPlan.out}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="font-bold text-xs text-[#2d3a2d] uppercase tracking-wider">Guest Count</span>
              <span className="bg-[#2d3a2d] text-white px-3 py-1 rounded-full text-[10px] font-bold">{guestCount}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max={Number(currentPlan.maxGuests) + 20} 
              value={guestCount} 
              onChange={e => setGuestCount(Number(e.target.value))} 
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-[#8ba88b] cursor-pointer" 
            />
          </div>

          <div className="bg-[#2d3a2d] p-8 rounded-[2rem] text-center text-white">
            <p className="text-[9px] uppercase opacity-40 tracking-[0.3em] mb-1">Experience Total</p>
            <div className="text-4xl font-serif italic">₹{totalPrice.toLocaleString('en-IN')}</div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleConfirmNow}
              className="group w-full bg-[#8ba88b] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#7a997a] transition-all shadow-lg active:scale-95"
            >
              <span className="font-serif italic text-xl">Confirm Booking</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleWhatsApp}
              className="w-full bg-white border border-gray-100 text-[#2d3a2d] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
            >
              <MessageCircle size={18} className="text-green-500"/> 
              <span className="text-sm">Inquire on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;