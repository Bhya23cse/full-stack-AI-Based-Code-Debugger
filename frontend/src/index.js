import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress ResizeObserver loop error
window.addEventListener("error", (e) => {
  const msg = e.message || "";
  if (
    msg.includes("ResizeObserver loop completed with undelivered notifications") ||
    msg.includes("ResizeObserver loop limit exceeded")
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional performance report
reportWebVitals();
