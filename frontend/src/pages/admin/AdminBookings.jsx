import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Wallet, WalletMinimal, Phone, MapPin, Users, 
  Loader2, Sparkles, Edit3, Trash2, Save, 
  CheckCircle2, Calendar, Search, MoreHorizontal, ChevronLeft, ChevronRight,
  UserCheck
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// Business Logic for Booking Types
const PLAN_TIMES = {
  Staycation: { in: "15:00", out: "12:00", nextDay: true },
  Daycation: { in: "09:00", out: "21:00", nextDay: false },
  Event: { in: "10:00", out: "23:00", nextDay: false }
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateFilter, setDateFilter] = useState('');
  
  // 1. Pull 'user' from Redux to get the logged-in admin's name
  const { token, user } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/bookings';

  const [formData, setFormData] = useState({
    guestName: '', guestPhone: '', guestPlace: '',
    checkIn: '', checkOut: '', totalPrice: 0,
    advance: 0, plan: 'Staycation', guestCount: 1
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(API_URL, config);
      setBookings(data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const isDateConflict = (dateStr) => {
    const times = PLAN_TIMES[formData.plan];
    const potentialIn = new Date(`${dateStr}T${times.in}`);
    let potentialOutDate = new Date(potentialIn);
    if (times.nextDay) {
      potentialOutDate.setDate(potentialOutDate.getDate() + 1);
    }
    const outDateStr = potentialOutDate.toLocaleDateString('en-CA');
    const potentialOut = new Date(`${outDateStr}T${times.out}`);

    return bookings.some(existing => {
      const existingIn = new Date(existing.checkIn);
      const existingOut = new Date(existing.checkOut);
      return potentialIn < existingOut && potentialOut > existingIn;
    });
  };

const handleCreateSubmit = async (e) => {
  e.preventDefault();
  
  // This captures the name of the person currently logged in (Admin or User)
  const bookerName = user?.name || "Guest User"; 

  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    const payload = {
      ...formData,
      bookedBy: user?.name // This sends "admin3" or the "User Name" to the DB
    };

    await axios.post(`${API_URL}/admin-book-manual`, payload, config);
    toast.success(`Booking recorded by ${bookerName}`);
    
    setIsCreateModalOpen(false);
    resetForm();
    fetchData();
  } catch (error) {
    toast.error("Error creating booking");
  }
};
  const resetForm = () => {
    setFormData({ 
      guestName: '', guestPhone: '', guestPlace: '', 
      checkIn: '', checkOut: '', totalPrice: 0, 
      advance: 0, plan: 'Staycation', guestCount: 1 
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay: firstDay === 0 ? 6 : firstDay - 1, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const handleDateClick = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = new Date(year, month, day).toLocaleDateString('en-CA');
    const times = PLAN_TIMES[formData.plan];
    const checkIn = `${dateStr}T${times.in}`;
    let checkOutDate = new Date(year, month, day);
    if (times.nextDay) { checkOutDate.setDate(checkOutDate.getDate() + 1); }
    const outDateStr = checkOutDate.toLocaleDateString('en-CA');
    const checkOut = `${outDateStr}T${times.out}`;
    setFormData({ ...formData, checkIn, checkOut });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`${API_URL}/${selectedBooking._id}`, selectedBooking, config);
      setBookings(bookings.map(b => b._id === data._id ? data : b));
      setSelectedBooking(data);
      setIsEditing(false);
      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleSettleFull = async () => {
    if (!window.confirm("Mark as fully paid?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`${API_URL}/${selectedBooking._id}`, {
        ...selectedBooking, advancePaid: selectedBooking.totalPrice
      }, config);
      setSelectedBooking(data);
      setBookings(bookings.map(b => b._id === data._id ? data : b));
      toast.success("Payment settled");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      setBookings(bookings.filter(b => b._id !== id));
      setIsDetailsModalOpen(false);
      toast.success("Booking removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const query = searchQuery.toLowerCase();
    const bookingDateStr = new Date(b.checkIn).toLocaleDateString('en-CA');
    const matchesText = b.guestName.toLowerCase().includes(query) || b.guestPhone.includes(query);
    const matchesDate = dateFilter ? bookingDateStr === dateFilter : true;
    return matchesText && matchesDate;
  });

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#8ba88b]" size={40} /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif italic text-3xl text-[#2d3a2d]">Reservations</h1>
          <p className="text-sm text-gray-400">Total active bookings: {bookings.length}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Name, Phone..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#8ba88b]/20" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <input type="date" className="hidden md:block px-4 py-3 bg-white border border-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#8ba88b]/20 text-gray-400" onChange={(e) => setDateFilter(e.target.value)} />
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#2d3a2d] text-white p-3 md:px-6 md:py-3 rounded-full flex items-center gap-2 hover:bg-[#3d4d3d] transition-all shadow-lg">
            <Plus size={20} /> <span className="hidden md:inline font-serif italic">New Booking</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Guest & Plan</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Duration</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Balance</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="group hover:bg-[#8ba88b]/5 transition-colors">
                 <td className="px-8 py-6">
  <p className="font-medium text-[#2d3a2d]">{b.guestName}</p>
  <div className="flex flex-col gap-1 mt-1">
    <span className="text-[9px] w-fit px-2 py-0.5 bg-gray-100 rounded-full font-bold uppercase text-gray-500">
      {b.plan}
    </span>
    
    <p className="text-[10px] text-[#8ba88b] font-medium flex items-center gap-1">
      <UserCheck size={12} className="text-[#8ba88b]" />
      <span>Account:</span>
      {/* This renders "admin3", "Nyha", or whatever name is in the DB */}
      <span className="text-gray-600 font-bold capitalize">
        {b.bookedBy || "Website/Direct"}
      </span>
    </p>
  </div>
</td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-gray-600 font-medium">{new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-[10px] text-gray-400">to {new Date(b.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className={`font-bold ${b.remainingBalance > 0 ? 'text-red-400' : 'text-gray-300'}`}>₹{b.remainingBalance}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${b.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => { setSelectedBooking(b); setIsDetailsModalOpen(true); setIsEditing(false); }} className="p-2 hover:bg-white rounded-full transition-shadow shadow-sm opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={18} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#2d3a2d]/40 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 relative my-auto shadow-2xl h-fit max-h-[95vh] overflow-y-auto"
            >
              <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"><X size={24} /></button>
              <h2 className="font-serif italic text-3xl text-[#2d3a2d] mb-8">Direct Booking</h2>
              
              <form onSubmit={handleCreateSubmit} className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Guest Name</label>
                  <input required className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm outline-none" placeholder="Full Name" onChange={(e) => setFormData({...formData, guestName: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Phone</label>
                  <input required className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm outline-none" placeholder="Mobile" onChange={(e) => setFormData({...formData, guestPhone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">No. of Guests</label>
                  <input required type="number" min="1" className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm outline-none" placeholder="2" onChange={(e) => setFormData({...formData, guestCount: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Select Plan</label>
                  <select className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm outline-none font-medium" value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value, checkIn: '', checkOut: ''})}>
                    <option value="Staycation">Staycation (3PM - 12PM)</option>
                    <option value="Daycation">Daycation (9AM - 9PM)</option>
                    <option value="Event">Event (10AM - 11PM)</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-4">
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ChevronLeft size={16}/></button>
                      <span className="text-sm font-bold uppercase tracking-widest text-[#2d3a2d]">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ChevronRight size={16}/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['M','T','W','T','F','S','S'].map(d => <span key={d} className="text-[10px] font-bold text-gray-300 mb-2">{d}</span>)}
                      {Array(firstDay).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-CA'); 
                        const isConflict = isDateConflict(dateStr);
                        const isSelected = formData.checkIn.startsWith(dateStr);
                        const isPast = dateStr < today;
                        return (
                          <button key={day} type="button" disabled={isPast || isConflict} onClick={() => handleDateClick(day)}
                            className={`h-10 w-full rounded-xl text-xs font-medium transition-all relative group ${isSelected ? 'bg-[#2d3a2d] text-white shadow-lg scale-105 z-10' : isConflict ? 'bg-red-50 text-red-300 cursor-not-allowed border border-red-50' : isPast ? 'text-gray-200' : 'hover:bg-[#8ba88b]/20 text-gray-600'}`}>
                            {day}
                            {isConflict && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-300 rounded-full"></span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
  
                  {formData.checkIn && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><Calendar size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmed Check-in</p>
                            <p className="text-sm font-medium text-[#2d3a2d]">
                              {new Date(formData.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 
                              <span className="text-gray-300 mx-2">@</span> 
                              {new Date(formData.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-gray-100" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#8ba88b]/10 rounded-xl text-[#8ba88b]"><Sparkles size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-[#8ba88b] uppercase tracking-widest">Auto Check-out</p>
                            <p className="text-sm font-medium text-[#2d3a2d]">
                              {new Date(formData.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 
                              <span className="text-gray-300 mx-2">@</span> 
                              {new Date(formData.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                          </div>
                        </div>
                        {PLAN_TIMES[formData.plan].nextDay && <span className="text-[9px] font-bold bg-[#2d3a2d] text-white px-3 py-1 rounded-full uppercase tracking-tighter">+1 Day Stay</span>}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Total Bill</label>
                  <input type="number" className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm font-bold" placeholder="₹" onChange={(e) => setFormData({...formData, totalPrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Advance</label>
                  <input type="number" className="w-full mt-1 p-4 bg-[#8ba88b]/10 rounded-2xl text-sm font-bold text-[#2d3a2d]" placeholder="₹" onChange={(e) => setFormData({...formData, advance: Number(e.target.value)})} />
                </div>

                <div className="col-span-2 bg-[#2d3a2d] p-6 rounded-[2.5rem] flex justify-between items-center text-white shadow-xl">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Pending Balance</p>
                    <p className="text-3xl font-serif italic">₹{(formData.totalPrice - formData.advance).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl"><Wallet size={24} /></div>
                </div>

                <button type="submit" className="col-span-2 w-full bg-[#8ba88b] text-white py-5 rounded-2xl font-serif italic text-xl hover:bg-[#7a997a] transition-all transform active:scale-95 shadow-lg">Confirm Booking</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW/EDIT MODAL */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[#2d3a2d]/60 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl"
            >
              <div className="flex justify-between mb-8">
                <div>
                  <h2 className="font-serif italic text-3xl text-[#2d3a2d]">{isEditing ? "Modify Record" : "Reservation Detail"}</h2>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${selectedBooking.remainingBalance === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {selectedBooking.remainingBalance === 0 ? 'Fully Paid' : `Owing ₹${selectedBooking.remainingBalance}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!isEditing && <button onClick={() => setIsEditing(true)} className="p-3 bg-gray-50 rounded-2xl text-blue-500 hover:bg-blue-50 transition-colors"><Edit3 size={18} /></button>}
                  <button onClick={() => handleDelete(selectedBooking._id)} className="p-3 bg-gray-50 rounded-2xl text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                  <button onClick={() => setIsDetailsModalOpen(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                </div>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Guest</label>
                    <input disabled={!isEditing} className={`w-full p-4 rounded-2xl text-sm ${isEditing ? 'bg-gray-50' : 'bg-transparent font-medium'}`} value={selectedBooking.guestName} onChange={(e) => setSelectedBooking({...selectedBooking, guestName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Contact</label>
                    <input disabled={!isEditing} className={`w-full p-4 rounded-2xl text-sm ${isEditing ? 'bg-gray-50' : 'bg-transparent font-medium'}`} value={selectedBooking.guestPhone} onChange={(e) => setSelectedBooking({...selectedBooking, guestPhone: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Guests</p>
                    <input type="number" disabled={!isEditing} className="bg-transparent text-sm font-bold w-full" value={selectedBooking.guestCount} onChange={(e) => setSelectedBooking({...selectedBooking, guestCount: e.target.value})} />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Total Bill</p>
                    <input type="number" disabled={!isEditing} className="bg-transparent text-sm font-bold w-full" value={selectedBooking.totalPrice} onChange={(e) => setSelectedBooking({...selectedBooking, totalPrice: e.target.value})} />
                  </div>
                  <div className="bg-[#8ba88b]/10 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-[#8ba88b] uppercase mb-1">Advance</p>
                    <input type="number" disabled={!isEditing} className="bg-transparent text-sm font-bold w-full text-[#2d3a2d]" value={selectedBooking.advancePaid} onChange={(e) => setSelectedBooking({...selectedBooking, advancePaid: e.target.value})} />
                  </div>
                  {/* 4. SHOW ADMIN NAME IN DETAILS MODAL */}
                  <div className="bg-gray-50 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Booked By</p>
                    <p className="text-sm font-bold text-[#2d3a2d] truncate capitalize">{selectedBooking.bookedBy || 'Direct'}</p>
                  </div>
                </div>

                {!isEditing && selectedBooking.remainingBalance > 0 && (
                  <button type="button" onClick={handleSettleFull} className="w-full py-4 bg-[#8ba88b] text-white rounded-2xl font-serif italic text-lg shadow-lg flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} /> Settle Outstanding Balance
                  </button>
                )}

                {isEditing && (
                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-[#2d3a2d] text-white rounded-2xl font-serif italic text-lg flex items-center justify-center gap-2 shadow-xl"><Save size={20} /> Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-serif italic">Cancel</button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookings;