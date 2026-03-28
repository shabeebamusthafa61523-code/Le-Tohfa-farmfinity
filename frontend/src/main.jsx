import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css' 
import { Provider } from 'react-redux'
import { store } from './redux/store'
import axios from 'axios'

// --- GLOBAL API CONFIGURATION ---
// This prioritizes the Vercel Environment Variable, then falls back to your Render URL.
const BACKEND_URL = import.meta.env.VITE_API_URL || "https://le-tohfa-farmfinity.onrender.com";

axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true; 

// --- REQUEST INTERCEPTOR ---
// Automatically attaches the token for "navaf" or any admin to every request.
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

console.log("🚀 System Connected to:", axios.defaults.baseURL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)