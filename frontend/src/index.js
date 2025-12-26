import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Add error handler for MetaMask
window.addEventListener('error', (event) => {
  if (event.message.includes('MetaMask') || event.message.includes('ethereum')) {
    event.stopImmediatePropagation();
    console.warn('MetaMask extension detected - not required for this app');
    return;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
