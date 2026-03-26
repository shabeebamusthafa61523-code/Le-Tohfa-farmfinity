import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BookingCalendar from '../components/BookingCalendar';
// 1. Import the correct names from your slice
import { setStayType, setGuestCount, updateTotalPrice } from '../redux/bookingSlice';

const Booking = () => {
  const dispatch = useDispatch();
  
  // 2. Map 'guests' and 'stayType' to match your slice's initialState keys
  const { stayType, guests, totalPrice } = useSelector((state) => state.booking);

  // 3. Helper to update state AND recalculate price in one go
  const handleTypeChange = (type) => {
    dispatch(setStayType(type));
    dispatch(updateTotalPrice());
  };

  const handleGuestChange = (count) => {
    dispatch(setGuestCount(Number(count)));
    dispatch(updateTotalPrice());
  };

  return (
    <div className="pt-32 pb-20 px-6 bg-[#f4f7f4] min-h-screen">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-4xl font-serif text-[#4a5d4a]">Reserve Your Stay</h2>
          
          <div className="space-y-4">
            <label className="block text-sm uppercase tracking-widest text-gray-500">Select Experience</label>
            <div className="grid grid-cols-3 gap-2">
              {['Daycation', 'Staycation', 'Events'].map(plan => (
                <button 
                  key={plan}
                  onClick={() => handleTypeChange(plan)}
                  className={`py-3 rounded-xl border transition ${stayType === plan ? 'bg-[#4a5d4a] text-white' : 'bg-white text-[#4a5d4a]'}`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm uppercase tracking-widest text-gray-500">Number of Guests</label>
            <input 
              type="number" 
              value={guests} 
              onChange={(e) => handleGuestChange(e.target.value)}
              className="w-full p-4 rounded-xl border-none shadow-inner"
            />
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#e0e7e0]">
            <p className="text-gray-500 uppercase tracking-tighter text-xs">Estimated Total</p>
            <h3 className="text-5xl font-serif text-[#4a5d4a] mt-2">₹{totalPrice.toLocaleString()}</h3>
            <button className="w-full mt-6 bg-[#4a5d4a] text-white py-4 rounded-xl hover:opacity-90 transition font-bold">
              Proceed to Payment
              </button>
          </div>
        </div>

        <div className="bg-white p-2 rounded-3xl shadow-xl overflow-hidden">
          <BookingCalendar />
        </div>
      </div>
    </div>
  );
};

export default Booking;