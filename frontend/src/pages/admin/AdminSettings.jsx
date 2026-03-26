import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, RefreshCw, DollarSign, Megaphone, Phone } from 'lucide-react'; // Swapped ShieldAlert for Phone
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (err) {
        toast.error("Failed to load settings.");
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/settings/update', settings);
      toast.success("System configurations published!");
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-20 text-center animate-pulse italic opacity-40">Synchronizing...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-28 px-6 pb-20">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <h1 className="font-serif italic text-5xl text-[#2d3a2d]">Admin Settings</h1>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-[#2d3a2d] text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-[#3d4a3d] disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>}
            {saving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>

        {/* 1. GLOBAL BROADCAST */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 lg:col-span-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-2xl"><Megaphone size={20} /></div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d3a2d]">Home Page Alert</h3>
                <p className="text-[10px] text-gray-400 font-medium">This stays saved even when turned off.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
               <span className={`text-[9px] font-bold uppercase tracking-widest ${settings.globalNotification?.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                 {settings.globalNotification?.isActive ? 'Live on Site' : 'Hidden'}
               </span>
               <Toggle 
                checked={settings.globalNotification?.isActive}
                onChange={(v) => setSettings({...settings, globalNotification: {...settings.globalNotification, isActive: v}})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Announcement Text</label>
              <textarea 
                className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-[#8ba88b]/20 italic"
                rows="2"
                placeholder="e.g. 20% Off for Weekend Bookings!"
                value={settings.globalNotification?.message}
                onChange={(e) => setSettings({...settings, globalNotification: {...settings.globalNotification, message: e.target.value}})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Display Style</label>
              <select 
                className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold focus:ring-2 focus:ring-[#8ba88b]/20 appearance-none"
                value={settings.globalNotification?.type}
                onChange={(e) => setSettings({...settings, globalNotification: {...settings.globalNotification, type: e.target.value}})}
              >
                <option value="info">Blue (Standard Update)</option>
                <option value="success">Green (Promotion/Offer)</option>
                <option value="warning">Amber (Important/Alert)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PRICING CARD */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-[#2d3a2d]">
              <DollarSign size={20} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Base Pricing Logic</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <InputField label="Online Advance (₹)" value={settings.advanceAmount} onChange={(v) => setSettings({...settings, advanceAmount: v})} />
              <InputField label="Staycation Base (₹)" value={settings.staycationPrice} onChange={(v) => setSettings({...settings, staycationPrice: v})} />
              <InputField label="Daycation Base (₹)" value={settings.daycationPrice} onChange={(v) => setSettings({...settings, daycationPrice: v})} />
              <InputField label="Event / Party Base (₹)" value={settings.eventPrice} onChange={(v) => setSettings({...settings, eventPrice: v})} />
            </div>
          </div>

          {/* CONTACT & SUPPORT CARD */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3 text-[#2d3a2d]">
              <Phone size={20} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Contact Support</h3>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <p className="text-[10px] text-gray-400 font-medium">Direct WhatsApp number for guest inquiries.</p>
              <InputField label="WhatsApp (Ex: 919876543210)" type="text" value={settings.whatsappNumber} onChange={(v) => setSettings({...settings, whatsappNumber: v})} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type="number" }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-1 focus:ring-[#8ba88b]" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#8ba88b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
  </label>
);

export default AdminSettings;