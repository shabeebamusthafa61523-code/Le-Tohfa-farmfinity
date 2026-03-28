import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, RefreshCw, DollarSign, Megaphone, Phone } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || "https://le-tohfa-farmfinity.onrender.com";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/settings`);
        setSettings(data);
      } catch (err) {
        toast.error("Failed to load system settings.");
        setSettings({
          advanceAmount: 0,
          staycationPrice: 0,
          daycationPrice: 0,
          eventPrice: 0,
          whatsappNumber: "",
          globalNotification: { isActive: false, message: "", type: "info" }
        });
      }
    };
    fetchSettings();
  }, [API_URL]);

  const handleSave = async () => {
    if (!token) return toast.error("Authentication required.");
    
    setSaving(true);
    try {
      const cleanToken = token.replace(/[\\"]/g, '').trim();
      const config = {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.put(`${API_URL}/api/settings/update`, settings, config);
      toast.success("Settings updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-20 text-center animate-pulse italic opacity-40 font-serif">Synchronizing...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-28 px-6 pb-20 text-[#2d3a2d]">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-serif italic text-5xl">System Config</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mt-2">Global Control Panel</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-[#2d3a2d] text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-[#3d4a3d] disabled:opacity-50 transition-all shadow-lg"
          >
            {saving ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>}
            {saving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>

        {/* 1. GLOBAL ANNOUNCEMENT */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-2xl"><Megaphone size={20} /></div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2d3a2d]">Home Page Alert</h3>
                <p className="text-[10px] text-gray-400 font-medium italic">Banner appears at the very top of the site.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
               <span className={`text-[9px] font-bold uppercase tracking-widest ${settings.globalNotification?.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                 {settings.globalNotification?.isActive ? 'Live' : 'Hidden'}
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
                value={settings.globalNotification?.message || ""}
                onChange={(e) => setSettings({...settings, globalNotification: {...settings.globalNotification, message: e.target.value}})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Display Style</label>
              <select 
                className="w-full h-[76px] bg-gray-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-[#8ba88b]/20 appearance-none"
                value={settings.globalNotification?.type || "info"}
                onChange={(e) => setSettings({...settings, globalNotification: {...settings.globalNotification, type: e.target.value}})}
              >
                <option value="info">Blue (Standard)</option>
                <option value="success">Green (Promo)</option>
                <option value="warning">Amber (Alert)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PRICING */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-[#8ba88b]" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Pricing Logic (₹)</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <InputField label="Advance Amount" value={settings.advanceAmount} onChange={(v) => setSettings({...settings, advanceAmount: Number(v)})} />
              <InputField label="Staycation Base" value={settings.staycationPrice} onChange={(v) => setSettings({...settings, staycationPrice: Number(v)})} />
              <InputField label="Daycation Base" value={settings.daycationPrice} onChange={(v) => setSettings({...settings, daycationPrice: Number(v)})} />
              <InputField label="Events Base" value={settings.eventPrice} onChange={(v) => setSettings({...settings, eventPrice: Number(v)})} />
            </div>
          </div>

          {/* SUPPORT */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
              <Phone size={20} className="text-[#8ba88b]" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Support Channel</h3>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-dashed border-gray-200">
              <p className="text-[10px] text-gray-400 font-medium">WhatsApp format: 91XXXXXXXXXX</p>
              <InputField label="WhatsApp Contact" type="text" value={settings.whatsappNumber} onChange={(v) => setSettings({...settings, whatsappNumber: v})} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InputField = ({ label, value, onChange, type="number" }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 text-sm font-bold focus:ring-1 focus:ring-[#8ba88b]" 
      value={value ?? ""} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked || false} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#8ba88b] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-sm"></div>
  </label>
);

export default AdminSettings;