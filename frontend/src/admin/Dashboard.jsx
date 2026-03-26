import React, { useState } from 'react';
import BookingList from './BookingList';
import AdminCalendar from '../pages/admin/AdminCalendar';

const Dashboard = () => {
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  return (
    <div className="flex min-h-screen bg-farm-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-farm-dark text-white p-8 hidden md:block">
        <h1 className="text-2xl font-serif mb-12 italic">LT Admin</h1>
        <nav className="space-y-6 text-xs uppercase tracking-widest">
          <button 
            onClick={() => setView('list')} 
            className={`block w-full text-left transition ${view === 'list' ? 'text-farm-sage font-bold' : 'opacity-60 hover:opacity-100'}`}
          >
            All Bookings
          </button>
          <button 
            onClick={() => setView('calendar')} 
            className={`block w-full text-left transition ${view === 'calendar' ? 'text-farm-sage font-bold' : 'opacity-60 hover:opacity-100'}`}
          >
            Availability Map
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-serif text-farm-dark capitalize">{view} View</h2>
          <div className="text-sm font-sans bg-farm-accent text-white px-4 py-2 rounded-lg">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
        </header>

        {view === 'list' ? <BookingList /> : <AdminCalendar />}
      </main>
    </div>
  );
};

export default Dashboard;