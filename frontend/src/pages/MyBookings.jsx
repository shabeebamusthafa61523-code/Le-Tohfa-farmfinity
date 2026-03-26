import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, User, Phone, Mail, X, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null); // Track which booking is open
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/website/my-bookings');
        setBookings(data);
      } catch (err) {
        toast.error("Failed to load your journeys");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-32 pb-20 px-6 selection:bg-[#8ba88b]/20">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif italic text-4xl text-[#2d3a2d] mb-12">Your Collections</h1>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div 
              key={booking._id} 
              onClick={() => setSelectedBooking(booking)}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 flex justify-between items-center cursor-pointer hover:border-[#8ba88b]/30 transition-all group"
            >
              <div className="flex gap-6 items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#8ba88b]">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#2d3a2d]">{booking.plan}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    {new Date(booking.checkIn).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#2d3a2d]">₹{booking.totalPrice.toLocaleString()}</p>
                <p className="text-[9px] uppercase tracking-tighter text-[#8ba88b] font-bold">View Details</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PREMIUM DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-[#2d3a2d]/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#2d3a2d] p-8 text-white flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Booking Confirmed</span>
                  <h2 className="text-3xl font-serif italic mt-1">{selectedBooking.plan}</h2>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8">
                {/* Guest Info Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Guest Details</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8ba88b] shadow-sm">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Guest Name</p>
                        <p className="text-sm font-medium text-[#2d3a2d]">{selectedBooking.guestName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8ba88b] shadow-sm">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Contact Number</p>
                        <p className="text-sm font-medium text-[#2d3a2d]">{selectedBooking.guestPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics Section */}
                <div className="grid grid-cols-2 gap-8 py-6 border-y border-dashed border-gray-100">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Check-In</p>
                    <p className="text-sm font-serif italic text-[#2d3a2d]">
                      {new Date(selectedBooking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Travelers</p>
                    <p className="text-sm font-serif italic text-[#2d3a2d]">{selectedBooking.guestCount} Persons</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#8ba88b]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Paid via {selectedBooking.paymentMethod || 'Wallet'}
                    </span>
                  </div>
                  <p className="text-xl font-serif text-[#2d3a2d]">₹{selectedBooking.totalPrice.toLocaleString()}</p>
                </div>

                <div className="pt-2">
                   <p className="text-[9px] text-center text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck size={12}/> Digitally Verified by Le'Tohfa Journeys
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