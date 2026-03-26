import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedDate: null,
  stayType: 'Staycation', // Options: 'Daycation' | 'Staycation' | 'Events'
  guests: 20,
  totalPrice: 12000,
  status: 'idle',
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // This is the missing piece your Booking.jsx is asking for
    setBookingDetails: (state, action) => {
      // Merges the new details (like dates or guest info) into the state
      return { ...state, ...action.payload };
    },
    
    setStayType: (state, action) => {
      state.stayType = action.payload;
    },
    
    setGuestCount: (state, action) => {
      state.guests = action.payload;
    },
    
    setDate: (state, action) => {
      state.selectedDate = action.payload;
    },

    updateTotalPrice: (state) => {
      // Pricing Logic:
      // Events: Flat 20,000
      // Others: 12,000 base + extra guest charges above 20 people
      const basePrice = state.stayType === 'Events' ? 20000 : 12000;
      let extraCharge = 0;
      
      if (state.guests > 20 && state.stayType !== 'Events') {
        // Staycation extra: 200/head | Daycation extra: 100/head
        const rate = state.stayType === 'Staycation' ? 200 : 100;
        extraCharge = (state.guests - 20) * rate;
      }
      
      state.totalPrice = basePrice + extraCharge;
    },
    
    resetBooking: (state) => {
      return initialState;
    }
  },
});

// Exporting everything so Booking.jsx doesn't throw the "Not Found" error
export const { 
  setBookingDetails, 
  setStayType, 
  setGuestCount, 
  updateTotalPrice, 
  setDate,
  resetBooking 
} = bookingSlice.actions;

export default bookingSlice.reducer;