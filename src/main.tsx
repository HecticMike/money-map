import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { DriveProvider } from './contexts/DriveContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DriveProvider clientId={clientId}>
      <App />
    </DriveProvider>
  </React.StrictMode>
);
