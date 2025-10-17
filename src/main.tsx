import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { DriveProvider } from './contexts/DriveContext';
import App from './App'; // import the real App component

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DriveProvider clientId={clientId}>
      <App /> {/* Render the actual App */}
    </DriveProvider>
  </React.StrictMode>
);
