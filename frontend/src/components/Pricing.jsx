import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookingCalendar from './BookingCalendar';

const Pricing = () => {
  const calendarRef = useRef(null);
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState("Staycation");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live settings from the backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (err) {
        console.error("Error loading dynamic pricing:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Map the data from Admin Settings into the UI array
  // We use .toLocaleString('en-IN') to get the Indian Currency format (e.g., 15,000)
  const pricingData = [
    {
      title: "Daycation",
      id: "Daycation",
      time: "9:00 AM - 9:00 PM",
      price: settings?.daycationPrice ? settings.daycationPrice.toLocaleString('en-IN') : "8,000",
      guests: "Up to 20 Guests",
      highlight: false
    },
    {
      title: "Overnight Stay",
      id: "Staycation",
      time: "3:00 PM - 12:00 PM",
      price: settings?.staycationPrice ? settings.staycationPrice.toLocaleString('en-IN') : "15,000",
      guests: "Up to 20 Guests",
      highlight: true 
    },
    {
      title: "Events",
      id: "Event",
      time: "10:00 AM - 11:00 PM",
      price: settings?.eventPrice ? settings.eventPrice.toLocaleString('en-IN') : "25,000",
      guests: "Up to 200 Guests",
      highlight: false
    }
  ];

  const isLoggedIn = !!localStorage.getItem('token');

  const handleBookNow = (planId) => {
    setSelectedPlan(planId);
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="py-32 text-center animate-pulse italic opacity-40 uppercase tracking-[0.3em] text-xs">
        Synchronizing Experience...
      </div>
    );
  }

  return (
    <section id="pricing" className="py-20 md:py-32 bg-[#fcfdfc]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="text-center mb-16 md:mb-20">
          <motion.span 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            className="text-[#8ba88b] uppercase tracking-[0.4em] text-[10px] font-bold block mb-4"
          >
            Reservations
          </motion.span>
          <h2 className="text-4xl md:text-7xl font-serif italic text-[#2d3a2d]">Select your experience</h2>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
          {pricingData.map((plan) => (
            <motion.div 
              key={plan.id}
              whileHover={{ y: -5 }}
              className={`relative p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-500 border flex flex-col justify-between ${
                plan.highlight 
                ? 'bg-[#2d3a2d] text-[#f4f7f4] border-transparent shadow-2xl md:scale-105 z-10' 
                : 'bg-white border-gray-100 text-[#2d3a2d] shadow-sm'
              }`}
            >
              <div>
                <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold mb-6 opacity-70">{plan.title}</h3>
                <div className="text-4xl md:text-5xl font-serif mb-8 flex items-baseline">
                  <span className="text-xl mr-1 italic">₹</span>{plan.price}
                </div>
                
                <div className="space-y-6 mb-12 text-sm">
                  <div className={`flex justify-between border-b pb-4 ${plan.highlight ? 'border-white/10' : 'border-gray-100'}`}>
                    <span className="opacity-60">Timing</span>
                    <span className="font-medium">{plan.time}</span>
                  </div>
                  <div className={`flex justify-between border-b pb-4 ${plan.highlight ? 'border-white/10' : 'border-gray-100'}`}>
                    <span className="opacity-60">Capacity</span>
                    <span className="font-medium">{plan.guests}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleBookNow(plan.id)}
                className={`w-full py-5 rounded-full font-serif italic text-lg transition-all duration-300 ${
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
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-12 shadow-2xl border border-gray-50"
            >
              {/* Passing settings to the calendar so it knows the advanceAmount */}
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
              className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-[#2d3a2d] p-10 md:p-24 text-center text-white"
            >
               <h3 className="text-3xl md:text-4xl font-serif italic mb-6">Unlock the Calendar</h3>
               <p className="text-[#f4f7f4]/60 mb-10 max-w-md mx-auto">Sign in to view real-time availability for your {selectedPlan} experience.</p>
               <button 
                 onClick={() => navigate('/login')} 
                 className="w-full md:w-auto px-12 py-5 bg-[#8ba88b] text-white rounded-full font-serif italic text-xl hover:bg-white hover:text-[#2d3a2d] transition-all"
                >
                 Login to Book
                </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Pricing;