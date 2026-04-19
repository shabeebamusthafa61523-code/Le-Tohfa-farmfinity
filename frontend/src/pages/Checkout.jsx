import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CreditCard, ChevronLeft, Loader2, ShieldCheck, User, MessageCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  // --- CONFIGURATION ---
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // Use settings amount for UI display, fallback to 3000
  const ADVANCE_AMOUNT_UI = settings?.advanceAmount || 3000;

  const [guestDetails, setGuestDetails] = useState({
    name: state?.formData?.guestName || user?.name || "",
    phone: state?.formData?.guestPhone || user?.phone || ""
  });
  const [isCustomGuest, setIsCustomGuest] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/settings`);
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, [API_URL]);

  if (!state || !state.formData) {
    return <div className="pt-40 text-center font-serif italic text-gray-500">No booking details found.</div>;
  }

  const { formData } = state;
  const balanceDueAtResortUI = formData.totalPrice - ADVANCE_AMOUNT_UI;

  // --- UI HELPERS ---
  const showConfirmationToast = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in zoom-in' : 'animate-out fade-out zoom-out'} max-w-md w-full bg-white shadow-2xl rounded-[2.5rem] p-6 border-b-8 border-[#8ba88b]`}>
        <div className="flex items-start">
          <div className="bg-[#8ba88b]/10 p-3 rounded-full">
            <CheckCircle className="h-10 w-10 text-[#8ba88b]" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-bold text-[#2d3a2d] uppercase tracking-widest">Journey Confirmed!</p>
            <p className="mt-1 text-xs text-gray-500 italic">Your sanctuary is ready. Your invoice is downloading.</p>
          </div>
        </div>
      </div>
    ), { duration: 5000 });
  };

  // UPDATED: Now accepts the actual amount paid from Razorpay
  const generateInvoice = (bookingId, actualPaidINR) => {
    try {
      const doc = new jsPDF();
      const remaining = formData.totalPrice - actualPaidINR;

      doc.setFont("times", "italic");
      doc.setFontSize(22);
      doc.setTextColor(45, 58, 45); 
      doc.text("Le'Tohfa Journeys", 105, 20, { align: 'center' });
      
      autoTable(doc, {
        startY: 40,
        head: [['Description', 'Details']],
        body: [
          ['Booking ID', bookingId.toUpperCase()],
          ['Guest Name', guestDetails.name],
          ['Phone Number', guestDetails.phone],
          ['Plan Selected', formData.plan],
          ['Check-In Date', new Date(formData.checkIn).toLocaleDateString('en-GB')],
          ['Total Package Price', `INR ${formData.totalPrice.toLocaleString()}`],
          ['Advance Paid', `INR ${actualPaidINR.toLocaleString()}`],
          ['Balance Due at Resort', `INR ${remaining.toLocaleString()}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [45, 58, 45] },
      });

      doc.save(`LeTohfa_Invoice_${bookingId.slice(-6)}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
    }
  };

  // --- CORE PAYMENT LOGIC ---
  const handleRazorpayPayment = async () => {
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const activeToken = token || localStorage.getItem('token');
    const cleanToken = (activeToken && activeToken !== 'undefined' && activeToken !== 'null') 
      ? activeToken.replace(/"/g, '') 
      : null;

    if (!cleanToken) return toast.error("Please log in again to continue.");
    if (!rzpKey || !window.Razorpay) return toast.error("Payment system offline.");

    setLoading(true);

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json'
        } 
      };

      // Step 1: Create the Booking in DB
      const { data: booking } = await axios.post(`${API_URL}/api/order/create`, {
        ...formData,
        guestName: guestDetails.name,
        guestPhone: guestDetails.phone,
      }, config);

      // Step 2: Initialize Razorpay Order (Fetched from dynamic backend settings)
      const { data: order } = await axios.post(`${API_URL}/api/order/razorpay-order/${booking._id}`, {}, config);

      // Extract the real amount (converted from paise)
      const actualPaidINR = order.amount / 100;

      const options = {
        key: rzpKey, 
        amount: order.amount,
        currency: order.currency,
        name: settings?.siteName || "Le'Tohfa Journeys",
        description: `Advance for ${formData.plan}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Step 3: Verify Payment
            const { data } = await axios.post(`${API_URL}/api/order/verify-razorpay`, { 
              ...response, 
              bookingId: booking._id 
            }, config);

            if (data.success) {
              showConfirmationToast();
              
              // Generate invoice using the actual amount from the order
              generateInvoice(booking._id, actualPaidINR);
              
              navigate('/booking-success', { 
                state: { 
                  booking: { 
                    ...booking, 
                    ...data.updatedBooking, 
                    advancePaid: actualPaidINR,
                    remainingBalance: formData.totalPrice - actualPaidINR
                  } 
                } 
              });
            }
          } catch (err) {
            toast.error("Payment verification failed. Check 'My Bookings'.");
          }
        },
        prefill: {
          name: guestDetails.name,
          contact: guestDetails.phone,
          email: user?.email
        },
        theme: { color: "#2d3a2d" },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || "Booking initialization failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Section: Details */}
        <div className="lg:col-span-7 space-y-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-[#2d3a2d]">
            <ChevronLeft size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          
          <h1 className="font-serif italic text-4xl text-[#2d3a2d]">Finalize Your Stay</h1>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-400">
              <h3>Guest Information</h3>
              <button onClick={() => setIsCustomGuest(!isCustomGuest)} className="text-[10px] text-[#8ba88b] border-b border-[#8ba88b]/30">
                {isCustomGuest ? "Use My Profile" : "Change Guest"}
              </button>
            </div>

            {isCustomGuest ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Name" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" value={guestDetails.name} onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})} />
                <input type="tel" placeholder="Phone" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm" value={guestDetails.phone} onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})} />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-sm">
                <User size={20} className="text-[#8ba88b]" />
                <div><p className="font-bold">{user?.name || "Guest"}</p><p className="opacity-50">{user?.phone || "No phone added"}</p></div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Price Breakdown</h3>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Total Package ({formData.plan})</span>
              <span>₹{formData.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-[#8ba88b] font-bold">
              <span>Advance Payment (Online)</span>
              <span>- ₹{ADVANCE_AMOUNT_UI.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-dashed flex justify-between items-center italic">
              <span className="font-serif text-xl">Balance Due at Resort</span>
              <span className="text-2xl font-serif text-[#2d3a2d]">₹{balanceDueAtResortUI.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Payment Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#2d3a2d] rounded-[3rem] p-10 text-white shadow-2xl sticky top-32 space-y-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Payment</p>
              <h2 className="text-4xl font-serif italic">Secure Advance</h2>
            </div>

            <button 
              disabled={loading}
              onClick={handleRazorpayPayment}
              className="w-full bg-[#8ba88b] hover:bg-[#9bb89b] p-6 rounded-2xl flex items-center justify-between transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-4 text-left">
                <CreditCard />
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight">Pay Advance ₹{ADVANCE_AMOUNT_UI.toLocaleString()}</p>
                  <p className="text-[10px] opacity-60">Balance: ₹{balanceDueAtResortUI.toLocaleString()}</p>
                </div>
              </div>
              {loading ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18} />}
            </button>

            <div className="text-center pt-4 border-t border-white/5 space-y-4">
              <p className="text-[10px] opacity-40 leading-relaxed italic">
                This ₹{ADVANCE_AMOUNT_UI.toLocaleString()} is a non-refundable security deposit to confirm your dates. 
                Remaining balance payable upon arrival.
              </p>
              <a href={`https://wa.me/${settings?.whatsappNumber || '91XXXXXXXXXX'}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[10px] text-[#8ba88b] font-bold uppercase tracking-widest">
                <MessageCircle size={14} /> Contact Concierge
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;