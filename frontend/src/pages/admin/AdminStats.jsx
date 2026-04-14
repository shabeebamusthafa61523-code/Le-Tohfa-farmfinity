import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Wallet, CalendarCheck, CalendarDays } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminStats = () => {
  // 1. Add state for the selected month (0-11)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingBalance: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenueHistory: []
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        // 2. Pass the month as a query parameter
        const { data } = await axios.get(`${API_URL}/api/admin/stats-summary?month=${selectedMonth}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, [selectedMonth]); // 3. Re-run whenever selectedMonth changes

  return (
    <div className="space-y-8">
      {/* Header with Month Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif italic text-3xl text-[#2d3a2d]">Dashboard Overview</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Analytics for {months[selectedMonth]}</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
          <CalendarDays size={18} className="text-[#8ba88b]" />
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-transparent text-sm font-bold text-[#2d3a2d] outline-none cursor-pointer"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<Wallet className="text-green-600" />} bgColor="bg-green-50" />
        <StatCard title="Pending" value={`₹${stats.pendingBalance.toLocaleString()}`} icon={<TrendingUp className="text-red-500" />} bgColor="bg-red-50" isAlert />
        <StatCard title="Bookings" value={stats.totalBookings} icon={<CalendarCheck className="text-blue-600" />} bgColor="bg-blue-50" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-purple-600" />} bgColor="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif italic text-xl text-[#2d3a2d]">Revenue Growth</h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Trend View</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueHistory}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8ba88b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8ba88b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                <YAxis hide={true} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="amount" stroke="#8ba88b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[#2d3a2d] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center">
          <h3 className="font-serif italic text-xl mb-4 text-[#8ba88b]">Monthly Context</h3>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Viewing stats for <strong>{months[selectedMonth]}</strong>. These figures reflect money collected and bookings made within this specific timeframe.
          </p>
          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Quick Tip</p>
            <p className="text-xs italic text-[#8ba88b]">Switch months to compare seasonal resort performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, isAlert }) => (
  <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
    <div className="flex items-center space-x-4 mb-4">
      <div className={`p-3 ${bgColor} rounded-2xl`}>{icon}</div>
      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{title}</span>
    </div>
    <h2 className={`text-3xl font-serif italic ${isAlert ? 'text-red-500' : 'text-[#2d3a2d]'}`}>{value}</h2>
  </motion.div>
);

export default AdminStats;