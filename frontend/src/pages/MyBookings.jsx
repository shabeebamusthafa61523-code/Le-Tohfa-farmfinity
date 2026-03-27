import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, User, Phone, X, ShieldCheck, CreditCard, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Define API_URL for Render deployment
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 2. Safety check for token
        if (!token) {
          toast.error("Please login to view your collections");
          setLoading(false);
          return;
        }

        // 3. Use Absolute URL + Auth Headers
        const { data } = await axios.get(`${API_URL}/api/order/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookings(data);
      } catch (err) {
        console.error("Booking fetch error:", err);
        toast.error("Failed to load your journeys");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-32 pb-20 px-6 selection:bg-[#8ba88b]/20">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <span className="text-[#8ba88b] uppercase tracking-[0.4em] text-[10px] font-bold block mb-2">History</span>
          <h1 className="font-serif italic text-4xl md:text-5xl text-[#2d3a2d]">Your Collections</h1>
        </motion.div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 w-full bg-gray-100/50 animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking, index) => (
              <motion.div 
                key={booking._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedBooking(booking)}
                className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 flex justify-between items-center cursor-pointer hover:border-[#8ba88b]/30 hover:shadow-xl hover:shadow-[#8ba88b]/5 transition-all group"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-14 h-14 bg-[#f4f7f4] rounded-2xl flex items-center justify-center text-[#8ba88b] group-hover:bg-[#8ba88b] group-hover:text-white transition-colors">
                    <Ticket size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#2d3a2d]">{booking.plan}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-1 font-bold">
                      {new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-serif text-[#2d3a2d]">₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#8ba88b] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Details →</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Calendar size={32} />
            </div>
            <h3 className="font-serif italic text-2xl text-[#2d3a2d]">No journeys yet</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">Your future experiences and staycations will appear here once booked.</p>
          </motion.div>
        )}
      </div>

      {/* --- PREMIUM DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-[#2d3a2d]/60 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#2d3a2d] p-8 md:p-10 text-white flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8ba88b]">Booking Confirmed</span>
                  <h2 className="text-3xl md:text-4xl font-serif italic mt-2">{selectedBooking.plan}</h2>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 md:p-10 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Guest Credentials</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-4 bg-[#fcfdfc] border border-gray-50 p-4 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8ba88b] shadow-sm">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-gray-400 font-bold tracking-tighter">Primary Guest</p>
                        <p className="text-sm font-medium text-[#2d3a2d]">{selectedBooking.guestName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[#fcfdfc] border border-gray-50 p-4 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8ba88b] shadow-sm">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-gray-400 font-bold tracking-tighter">Communication</p>
                        <p className="text-sm font-medium text-[#2d3a2d]">{selectedBooking.guestPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-dashed border-gray-100">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Arrival Date</p>
                    <p className="text-base font-serif italic text-[#2d3a2d]">
                      {new Date(selectedBooking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1 tracking-widest">Travelers</p>
                    <p className="text-base font-serif italic text-[#2d3a2d]">{selectedBooking.guestCount} Guests</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#f4f7f4] p-6 rounded-[2rem]">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#8ba88b]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2d3a2d]/60">
                      Collection Total
                    </span>
                  </div>
                  <p className="text-2xl font-serif text-[#2d3a2d]">₹{selectedBooking.totalPrice.toLocaleString('en-IN')}</p>
                </div>

                <div className="pt-2">
                   <p className="text-[9px] text-center text-gray-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <ShieldCheck size={12} className="text-[#8ba88b]"/> Secured by Le'Tohfa Journeys
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;