import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    auth: authReducer,
  },
});