import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Calendar, User, ArrowRight, Eye, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  // Safeguard if state is missing
  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-serif italic text-gray-500">
        <p>No booking record found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-xs uppercase tracking-widest text-[#8ba88b]">Return Home</button>
      </div>
    );
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleInvoice = (action = 'download') => {
    const doc = new jsPDF();
    
    // Header Style
    doc.setFont("times", "italic");
    doc.setFontSize(22);
    doc.setTextColor(45, 58, 45); 
    doc.text("Le'Tohfa Journeys", 105, 20, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Official Booking Confirmation & Receipt", 105, 28, { align: 'center' });

    autoTable(doc, {
      startY: 40,
      head: [['Description', 'Details']],
      body: [
        ['Booking ID', booking._id.toUpperCase()],
        ['Guest Name', booking.guestName],
        ['Plan Selected', booking.plan],
        ['Check-In Time', formatDateTime(booking.checkIn)],
        ['Check-Out Time', formatDateTime(booking.checkOut)],
        ['Total Guests', `${booking.guestCount} Persons`],
        ['Total Package Price', `INR ${booking.totalPrice.toLocaleString()}`],
        ['Advance Paid (Online)', `INR ${booking.advancePaid.toLocaleString()}`],
        ['Balance Due at Resort', `INR ${booking.remainingBalance.toLocaleString()}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [45, 58, 45] },
      styles: { cellPadding: 5, fontSize: 10 }
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Note: Please present this invoice at the resort during check-in.", 14, finalY + 15);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY + 22);

    if (action === 'preview') {
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } else {
      doc.save(`LeTohfa_Invoice_${booking._id.slice(-6)}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-6 pt-20">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Animated Success Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-[#8ba88b]/10 p-6 rounded-full animate-pulse">
            <CheckCircle size={64} className="text-[#8ba88b]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif italic text-5xl text-[#2d3a2d]">Journey Confirmed</h1>
            <p className="text-gray-500 italic">Your sanctuary is prepared and awaiting your arrival.</p>
          </div>
        </div>

        {/* Quick Details Card */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Calendar className="text-[#8ba88b]" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Check-In Date</p>
              <p className="text-sm font-bold">{new Date(booking.checkIn).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Clock className="text-[#8ba88b]" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Arrival Time</p>
              <p className="text-sm font-bold">{new Date(booking.checkIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <User className="text-[#8ba88b]" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Primary Guest</p>
              <p className="text-sm font-bold">{booking.guestName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl text-[#8ba88b]">
              <span className="font-bold text-xs">INR</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Balance Due</p>
              <p className="text-sm font-bold">₹{booking.remainingBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleInvoice('preview')}
              className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all w-full sm:w-auto"
            >
              <Eye size={16} /> Preview Invoice
            </button>
            
            <button 
              onClick={() => handleInvoice('download')}
              className="flex items-center justify-center gap-2 bg-[#2d3a2d] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#3d4a3d] transition-all w-full sm:w-auto shadow-lg shadow-[#2d3a2d]/20"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button 
              onClick={() => navigate('/my-bookings')}
              className="flex items-center justify-center gap-2 text-gray-400 px-8 py-2 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:text-[#2d3a2d] transition-all"
            >
              View My Bookings <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <button 
          onClick={() => navigate('/')}
          className="pt-8 text-[10px] text-gray-300 uppercase tracking-[0.4em] flex items-center justify-center gap-2 mx-auto hover:text-[#8ba88b] transition-colors"
        >
          <Home size={12} /> Return to Home
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;