import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './app.css' 
import { Provider } from 'react-redux'
import { store } from './redux/store'
import axios from 'axios'

// --- AXIOS INTERCEPTOR ---
// This handles the "Authorization: Bearer <token>" for every request automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)