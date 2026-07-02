import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './design-system/globals.css';
import { applyTheme } from './store/theme';

const saved = localStorage.getItem('af-salon-theme');
const initial = saved ? JSON.parse(saved)?.state?.theme : 'light';
applyTheme(initial ?? 'light');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
