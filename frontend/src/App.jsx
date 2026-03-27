import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import AdminSidebar from './components/admin/AdminSidebar';
import AdminLayout from './components/admin/AdminLayout';
import GlobalBanner from './components/GlobalBanner'; // Import the banner

// Pages
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Dashboard from './admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminStats from './pages/admin/AdminStats';
import AdminCalendar from './pages/admin/AdminCalendar';
import UserProfile from './pages/UserProfile';
import BookingSuccess from './pages/BookingSuccess';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. FETCH GLOBAL SETTINGS ON APP LOAD
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (err) {
        console.error("System sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. MAINTENANCE MODE GUARD
  if (settings?.isMaintenanceMode) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fcfcfc] text-center p-10">
        <h1 className="font-serif italic text-5xl text-[#2d3a2d]">Peace is being restored...</h1>
        <p className="text-gray-400 mt-6 max-w-md italic">
          Le'Tohfa Journeys is currently undergoing a digital refresh. 
          We'll be back online shortly.
        </p>
        <a 
          href={`https://wa.me/${settings.whatsappNumber}`} 
          className="mt-10 text-[#8ba88b] font-bold uppercase text-[10px] tracking-widest border-b border-[#8ba88b] pb-1"
        >
          Contact Concierge
        </a>
      </div>
    );
  }

  return (
    <Router>
      {/* 3. GLOBAL BANNER (Only shows if active in Admin) */}
      <GlobalBanner settings={settings} />

      {/* Adjust layout if Banner is active */}
<div 
      className="transition-all duration-500 ease-in-out"
      style={{ marginTop: settings?.globalNotification?.isActive ? '40px' : '0px' }}
    >        
        <Navbar toggleAdminSidebar={() => setIsAdminSidebarOpen(prev => !prev)} />    
        
        <AdminSidebar 
          isOpen={isAdminSidebarOpen} 
          onClose={() => setIsAdminSidebarOpen(false)} 
        />

        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* Pass settings as props where needed */}
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/booking" element={<Booking settings={settings} />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/checkout" element={<Checkout settings={settings} />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminStats />} /> 
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="availability" element={<AdminCalendar />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;