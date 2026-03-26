import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Wallet, CalendarCheck } from 'lucide-react';
import axios from 'axios';
// Import Recharts components
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingBalance: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenueHistory: [] // Added for the chart
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/admin/stats-summary', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Row: Quick Glance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={<Wallet className="text-green-600" />} 
          bgColor="bg-green-50" 
        />
        <StatCard 
          title="Pending Balance" 
          value={`₹${stats.pendingBalance.toLocaleString()}`} 
          icon={<TrendingUp className="text-red-500" />} 
          bgColor="bg-red-50" 
          isAlert
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={<CalendarCheck className="text-blue-600" />} 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Logged Users" 
          value={stats.totalUsers} 
          icon={<Users className="text-purple-600" />} 
          bgColor="bg-purple-50" 
        />
      </div>

      {/* Middle Row: Visual Break / Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* REVENUE CHART - Now takes up 2 columns for better visibility */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif italic text-xl text-[#2d3a2d]">Revenue Growth</h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Last 7 Days</span>
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
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af'}}
                  dy={10}
                />
                <YAxis 
                  hide={true} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8ba88b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* MANAGEMENT NOTE */}
        <div className="bg-[#2d3a2d] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center">
          <h3 className="font-serif italic text-xl mb-4 text-[#8ba88b]">Management Note</h3>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Remember to check the <strong>Pending Balance</strong> regularly. 
            High balances usually mean payments were made in cash at the farm.
          </p>
          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Quick Tip</p>
            <p className="text-xs italic text-[#8ba88b]">Update cash payments in the "Bookings" tab to clear pending alerts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, isAlert }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100"
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className={`p-3 ${bgColor} rounded-2xl`}>
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
        {title}
      </span>
    </div>
    <h2 className={`text-3xl font-serif italic ${isAlert ? 'text-red-500' : 'text-[#2d3a2d]'}`}>
      {value}
    </h2>
  </motion.div>
);

export default AdminStats;