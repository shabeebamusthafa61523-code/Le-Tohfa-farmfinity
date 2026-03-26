import { createSlice } from '@reduxjs/toolkit';

// Robust initialization from localStorage
const savedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const savedToken = localStorage.getItem('token') || null;

const initialState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      // Sync with Browser Storage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },

    // 🔥 THE CRITICAL ADDITION: Update Wallet Balance in UI
    updateBalance: (state, action) => {
      if (state.user) {
        // Update the state
        state.user.walletBalance = action.payload;
        
        // Update localStorage so refresh doesn't revert the balance
        const updatedUser = { ...state.user, walletBalance: action.payload };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    },
    
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  authStart, 
  authSuccess, 
  authFailure, 
  logout, 
  clearAuthError,
  updateBalance // Export the new action
} = authSlice.actions;

export default authSlice.reducer;