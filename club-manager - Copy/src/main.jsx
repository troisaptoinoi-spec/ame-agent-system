import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/index.js';
import { STORAGE_KEYS } from './constants.js';

// Debug system — only in development
if (import.meta.env.DEV) {
  import('./utils/debug.js');
}

// Apply theme on load
const theme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
document.documentElement.setAttribute('data-theme', theme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
