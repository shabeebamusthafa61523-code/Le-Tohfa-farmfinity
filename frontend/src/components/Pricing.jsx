import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Info, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import BookingCalendar from './BookingCalendar';

const Pricing = () => {
  const calendarRef = useRef(null);
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState("Staycation");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/settings`);
        setSettings(data);
      } catch (err) {
        console.error("Dynamic pricing sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL]);

  // Helper for dynamic banner styling
  const getBannerStyles = (type) => {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: <Sparkles size={14}/> };
      case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: <AlertTriangle size={14}/> };
      default: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: <Info size={14}/> };
    }
  };

  const pricingData = [
    {
      title: "Daycation",
      id: "Daycation",
      time: "9:00 AM - 9:00 PM",
      price: settings?.daycationPrice?.toLocaleString('en-IN') || "8,000",
      guests: "Up to 20 Guests",
      highlight: false
    },
    {
      title: "Overnight Stay",
      id: "Staycation",
      time: "3:00 PM - 12:00 PM",
      price: settings?.staycationPrice?.toLocaleString('en-IN') || "15,000",
      guests: "Up to 20 Guests",
      highlight: true 
    },
    {
      title: "Events",
      id: "Event",
      time: "10:00 AM - 11:00 PM",
      price: settings?.eventPrice?.toLocaleString('en-IN') || "25,000",
      guests: "Up to 200 Guests",
      highlight: false
    }
  ];

  const isLoggedIn = !!localStorage.getItem('token');

  const handleBookNow = (planId) => {
    setSelectedPlan(planId);
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center bg-[#fcfdfc]">
        <div className="w-12 h-12 border-2 border-[#8ba88b]/20 border-t-[#8ba88b] rounded-full animate-spin mb-6" />
        <div className="text-center animate-pulse italic opacity-40 uppercase tracking-[0.3em] text-[10px] text-[#2d3a2d]">
          Synchronizing Sanctuary...
        </div>
      </div>
    );
  }

  const banner = getBannerStyles(settings?.globalNotification?.type);

  return (
    <>
      {/* GLOBAL ANNOUNCEMENT BAR */}
      <AnimatePresence>
        {settings?.globalNotification?.isActive && settings?.globalNotification?.message && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed top-0 left-0 w-full z-[999] border-b ${banner.border} ${banner.bg} backdrop-blur-md shadow-sm`}
          >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3">
              <span className={banner.text}>{banner.icon}</span>
              <p className={`text-[10px] md:text-[11px] font-bold tracking-[0.12em] uppercase ${banner.text}`}>
                {settings.globalNotification.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section 
        id="pricing" 
        className={`bg-[#fcfdfc] transition-all duration-500 ${settings?.globalNotification?.isActive ? 'pt-32 md:pt-44' : 'py-20 md:py-32'}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="text-center mb-16 md:mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              className="text-[#8ba88b] uppercase tracking-[0.4em] text-[10px] font-bold block mb-4"
            >
              Reservations
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-serif italic text-[#2d3a2d]"
            >
              Select your experience
            </motion.h2>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
            {pricingData.map((plan, index) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-500 border flex flex-col justify-between ${
                  plan.highlight 
                  ? 'bg-[#2d3a2d] text-[#f4f7f4] border-transparent shadow-2xl md:scale-105 z-10' 
                  : 'bg-white border-gray-100 text-[#2d3a2d] shadow-sm hover:shadow-xl'
                }`}
              >
                <div>
                  <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold mb-6 opacity-70">{plan.title}</h3>
                  <div className="text-4xl md:text-5xl font-serif mb-8 flex items-baseline">
                    <span className="text-xl mr-1 italic opacity-60">₹</span>{plan.price}
                  </div>
                  
                  <div className="space-y-6 mb-12 text-sm">
                    <div className={`flex justify-between border-b pb-4 ${plan.highlight ? 'border-white/10' : 'border-gray-100'}`}>
                      <span className="opacity-60 font-light">Timing</span>
                      <span className="font-medium tracking-tight">{plan.time}</span>
                    </div>
                    <div className={`flex justify-between border-b pb-4 ${plan.highlight ? 'border-white/10' : 'border-gray-100'}`}>
                      <span className="opacity-60 font-light">Capacity</span>
                      <span className="font-medium tracking-tight">{plan.guests}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleBookNow(plan.id)}
                  className={`w-full py-5 rounded-full font-serif italic text-lg transition-all duration-300 transform active:scale-95 ${
                    plan.highlight 
                    ? 'bg-[#8ba88b] text-white hover:bg-white hover:text-[#2d3a2d]' 
                    : 'bg-[#2d3a2d] text-white hover:bg-[#3d4d3d]'
                  }`}
                >
                  Check Dates
                </button>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Calendar Section */}
          <div ref={calendarRef} className="pt-10 scroll-mt-20">
            {isLoggedIn ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-4 md:p-12 shadow-2xl border border-gray-50 overflow-hidden"
              >
                <BookingCalendar 
                  activePlan={selectedPlan} 
                  onPlanChange={setSelectedPlan} 
                  settings={settings}
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-[#2d3a2d] p-10 md:p-24 text-center text-white"
              >
                <div className="relative z-10">
                  <h3 className="text-3xl md:text-5xl font-serif italic mb-6">Unlock the Calendar</h3>
                  <p className="text-[#f4f7f4]/60 mb-10 max-w-md mx-auto font-light">Sign in to view real-time availability and confirm your {selectedPlan} experience.</p>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full md:w-auto px-16 py-5 bg-[#8ba88b] text-white rounded-full font-serif italic text-xl hover:bg-white hover:text-[#2d3a2d] transition-all shadow-xl"
                  >
                    Login to Book
                  </button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8ba88b] via-transparent to-transparent" />
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;