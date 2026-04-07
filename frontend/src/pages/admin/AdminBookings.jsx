import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // 1. Added Redux hook
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Sparkles, Wallet, Edit3, Trash2, Save, 
  CheckCircle2, ChevronLeft, ChevronRight, Search, Plus, User, ShieldAlert, Phone, UserCheck
} from 'lucide-react';

const PLAN_TIMES = {
  Staycation: { in: "15:00", out: "12:00", nextDay: true },
  Daycation: { in: "09:00", out: "21:00", nextDay: false },
  Event: { in: "10:00", out: "23:00", nextDay: false }
};

const AdminBookings = () => {
  // --- Redux State ---
  const { user } = useSelector((state) => state.auth); // 2. Get current logged-in admin

  // --- States ---
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date().toLocaleDateString('en-CA');

  const [formData, setFormData] = useState({
    guestName: '', guestPhone: '', plan: 'Staycation',
    guestCount: 2, totalPrice: 0, advance: 0,
    checkIn: '', checkOut: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('userInfo'))?.token;

  // --- Helpers ---
  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(data) ? data : (data.allBookings || []));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const isDateConflict = (dateStr) => {
    const selectedDate = new Date(dateStr);
    return bookings.some(b => {
      const bCheckInStr = b.checkIn.split('T')[0];
      if (bCheckInStr === dateStr) return true;
      if (formData.plan !== 'Staycation') {
        const yesterday = new Date(selectedDate);
        yesterday.setDate(yesterday.getDate() - 1);
        return bCheckInStr === yesterday.toLocaleDateString('en-CA') && b.plan === 'Staycation';
      }
      if (formData.plan === 'Staycation') {
        const tomorrow = new Date(selectedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return bCheckInStr === tomorrow.toLocaleDateString('en-CA') && (b.plan === 'Daycation' || b.plan === 'Event');
      }
      return false;
    });
  };

  const handleDateClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toLocaleDateString('en-CA');
    const times = PLAN_TIMES[formData.plan];
    let checkOutDate = new Date(date);
    if (times.nextDay) checkOutDate.setDate(checkOutDate.getDate() + 1);
    setFormData({
      ...formData,
      checkIn: `${dateStr}T${times.in}`,
      checkOut: `${checkOutDate.toLocaleDateString('en-CA')}T${times.out}`
    });
  };

  // --- CRUD Actions ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // 3. Inject the admin name from Redux into the payload
      const payload = {
        ...formData,
        bookedBy: user?.name || "Admin" 
      };

      await axios.post(`${API_URL}/api/bookings/admin-book-manual`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsCreateModalOpen(false);
      fetchBookings();
      setFormData({ guestName: '', guestPhone: '', plan: 'Staycation', guestCount: 2, totalPrice: 0, advance: 0, checkIn: '', checkOut: '' });
    } catch (err) { alert(err.response?.data?.message || "Booking failed"); }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/bookings/${selectedBooking._id}`, selectedBooking, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      setIsDetailsModalOpen(false);
      fetchBookings();
    } catch (err) { alert("Update failed"); }
  };

  const handleSettleFull = async () => {
    const updated = { ...selectedBooking, advancePaid: selectedBooking.totalPrice };
    try {
      await axios.put(`${API_URL}/api/bookings/${selectedBooking._id}`, updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedBooking(updated);
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDetailsModalOpen(false);
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const filtered = bookings.filter(b => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = b.guestName?.toLowerCase().includes(searchLower);
    const phoneMatch = b.guestPhone?.toString().includes(searchLower);
    const checkInDate = new Date(b.checkIn);
    const readableMatch = checkInDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toLowerCase().includes(searchLower);
    return nameMatch || phoneMatch || readableMatch;
  });

  return (
    <div className="p-6 bg-[#fdfdfd] min-h-screen font-sans">
      {/* Dashboard Top Bar */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-serif italic text-[#2d3a2d]">Admin Bookings</h1>
          <p className="text-gray-400 text-sm italic">Logged in as {user?.name || 'Staff'}</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none"
                    placeholder="Search name, phone, or date..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#2d3a2d] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:bg-black transition-all">
                <Plus size={20}/> New Booking
            </button>
        </div>
      </div>

      {/* Main List Display */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-1 gap-6">
        {filtered.map(b => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={b._id} 
            onClick={() => { setSelectedBooking(b); setIsDetailsModalOpen(true); setIsEditing(false); }}
            className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-2xl ${b.guestName === "ADMIN BLOCK" ? "bg-red-50 text-red-400" : "bg-[#f4f7f4] text-[#8ba88b]"}`}>
                  {b.guestName === "ADMIN BLOCK" ? <ShieldAlert size={20}/> : <User size={20}/>}
               </div>
               <span className={`text-[9px] font-black px-3 py-1 rounded-full ${b.totalPrice - (b.advancePaid || b.advanceAmount) === 0 ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                  {b.totalPrice - (b.advancePaid || b.advanceAmount) === 0 ? "PAID" : "PENDING"}
               </span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 truncate">{b.guestName}</h3>
            <p className="text-[11px] text-gray-400 font-bold mb-1 tracking-wider">{b.guestPhone}</p>
            <p className="text-[11px] text-gray-400 font-bold mb-1 tracking-wider">{b.plan}</p>
            <p className="text-xs text-gray-400 font-medium mb-4">
                {new Date(b.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                {b.plan === 'Staycation' && ` → ${new Date(b.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
            </p>
            
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl mb-2">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Handled By</p>
                  <p className="text-[11px] font-bold text-gray-700 capitalize flex items-center gap-1">
                    <UserCheck size={12} className="text-[#8ba88b]"/> {b.bookedBy || "System"}
                  </p>
                </div>
                <span className="font-bold text-[#2d3a2d]">₹{b.totalPrice}</span>
            </div>
          </motion.div>
        ))}
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
                  <input required className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm outline-none" placeholder="Mobile Number" onChange={(e) => setFormData({...formData, guestPhone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">No. of Guests</label>
                  <input required type="number" min="1" className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm outline-none" placeholder="2" onChange={(e) => setFormData({...formData, guestCount: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Select Plan</label>
                  <select 
                    className="w-full mt-1 p-4 bg-gray-50 rounded-2xl text-sm outline-none font-medium" 
                    value={formData.plan} 
                    onChange={(e) => setFormData({...formData, plan: e.target.value, checkIn: '', checkOut: ''})}
                  >
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
                      {['M','T','W','T','F','S','S'].map((d, i) => (
                        <span key={`${d}-${i}`} className="text-[10px] font-bold text-gray-300 mb-2">{d}</span>
                      ))}
                      {Array(firstDay === 0 ? 6 : firstDay - 1).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-CA'); 
                        const isConflict = isDateConflict(dateStr);
                        const isSelected = formData.checkIn.startsWith(dateStr);
                        const isPast = dateStr < today;

                        return (
                          <button 
                            key={day} type="button" disabled={isPast || isConflict} onClick={() => handleDateClick(day)}
                            className={`h-11 w-full rounded-2xl text-xs font-bold transition-all relative
                              ${isSelected ? 'bg-[#2d3a2d] text-white shadow-xl scale-105 z-10' : isConflict ? 'bg-red-50 text-red-300 cursor-not-allowed opacity-60' : isPast ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-[#8ba88b]/10 text-[#2d3a2d] border border-transparent hover:border-[#8ba88b]/20'}`}
                          >
                            {day}
                            {isConflict && !isPast && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />}
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
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-in</p>
                            <p className="text-sm font-medium text-[#2d3a2d]">{new Date(formData.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} @ {new Date(formData.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-gray-100" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#8ba88b]/10 rounded-xl text-[#8ba88b]"><Sparkles size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-[#8ba88b] uppercase tracking-widest">Check-out</p>
                            <p className="text-sm font-medium text-[#2d3a2d]">{new Date(formData.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} @ {new Date(formData.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                          </div>
                        </div>
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

                <button type="submit" className="col-span-2 w-full bg-[#8ba88b] text-white py-5 rounded-2xl font-serif italic text-xl hover:bg-[#7a997a] transition-all transform active:scale-95 shadow-lg mt-4">Confirm Booking</button>
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
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${selectedBooking.totalPrice - (selectedBooking.advancePaid || selectedBooking.advanceAmount) === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {selectedBooking.totalPrice - (selectedBooking.advancePaid || selectedBooking.advanceAmount) === 0 ? 'Fully Paid' : `Owing ₹${selectedBooking.totalPrice - (selectedBooking.advancePaid || selectedBooking.advanceAmount)}`}
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
                    <div className="relative">
                        <input disabled={!isEditing} className={`w-full p-4 rounded-2xl text-sm ${isEditing ? 'bg-gray-50' : 'bg-transparent font-medium'}`} value={selectedBooking.guestPhone} onChange={(e) => setSelectedBooking({...selectedBooking, guestPhone: e.target.value})} />
                        {!isEditing && (
                            <a href={`tel:${selectedBooking.guestPhone}`} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#8ba88b]/10 text-[#8ba88b] rounded-xl hover:bg-[#8ba88b]/20 transition-colors">
                                <Phone size={16} />
                            </a>
                        )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Guests</p>
                    <input type="number" disabled={!isEditing} className="bg-transparent text-sm font-bold w-full outline-none" value={selectedBooking.guestCount} onChange={(e) => setSelectedBooking({...selectedBooking, guestCount: e.target.value})} />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Total Bill</p>
                    <input type="number" disabled={!isEditing} className="bg-transparent text-sm font-bold w-full outline-none" value={selectedBooking.totalPrice} onChange={(e) => setSelectedBooking({...selectedBooking, totalPrice: e.target.value})} />
                  </div>
                  <div className="bg-[#8ba88b]/10 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-[#8ba88b] uppercase mb-1">Advance</p>
                    <input type="number" disabled={!isEditing} className="bg-transparent text-sm font-bold w-full text-[#2d3a2d] outline-none" value={selectedBooking.advancePaid || selectedBooking.advanceAmount} onChange={(e) => setSelectedBooking({...selectedBooking, advancePaid: e.target.value})} />
                  </div>
                   <div className="bg-gray-50 p-4 rounded-[2rem]">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Booked By</p>
                    <p className="text-sm font-bold text-[#2d3a2d] truncate capitalize">{selectedBooking.bookedBy || 'Direct'}</p>
                  </div>
                </div>

                {!isEditing && (selectedBooking.totalPrice - (selectedBooking.advancePaid || selectedBooking.advanceAmount) > 0) && (
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