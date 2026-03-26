import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="flex min-h-screen bg-[#fcfdfc]">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif italic text-[#2d3a2d]">Welcome back, Boss</h2>
            <p className="text-gray-400 text-sm">Here is what's happening at the farm today.</p>
          </div>
          <div className="bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-medium text-[#2d3a2d]">
            March 12, 2026
          </div>
        </header>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Total Revenue" value="₹2,45,000" trend="+12%" />
            <StatCard title="Total Bookings" value="48" trend="+5" />
            <StatCard title="New Guests" value="12" trend="+3" />
          </div>
        )}

        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-100">
                 <tr>
                   <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Guest</th>
                   <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Plan</th>
                   <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Date</th>
                   <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {/* Map through your actual DB data here */}
                 <tr className="hover:bg-gray-50/50 transition-colors">
                   <td className="px-8 py-6 font-medium text-[#2d3a2d]">Rahul Sharma</td>
                   <td className="px-8 py-6 italic text-gray-500">Overnight Stay</td>
                   <td className="px-8 py-6 text-gray-500 font-light">Mar 15, 2026</td>
                   <td className="px-8 py-6">
                     <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-tighter">Confirmed</span>
                   </td>
                 </tr>
               </tbody>
             </table>
          </motion.div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, trend }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8ba88b] mb-4">{title}</p>
    <div className="flex justify-between items-baseline">
      <h4 className="text-4xl font-serif italic text-[#2d3a2d]">{value}</h4>
      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">{trend}</span>
    </div>
  </div>
);

export default AdminDashboard;