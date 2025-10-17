// src/main.tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { DriveProvider, useDriveContext } from './contexts/DriveContext';
import { PwaUpdater } from './components/PwaUpdater';
import { registerSW } from 'virtual:pwa-register';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ✅ Register the service worker immediately
const updateSW = registerSW({ immediate: true });

const RootApp: React.FC = () => {
  const { fetchDriveData } = useDriveContext();

  // Automatically fetch Drive data after SW installs or updates
  useEffect(() => {
    let isMounted = true;

    if (updateSW.onRegisteredSW) {
      updateSW.onRegisteredSW((sw: ServiceWorkerRegistration | null) => {
        if (isMounted) fetchDriveData?.();
      });
    }

    if (updateSW.onRegisterError) {
      updateSW.onRegisterError((error: unknown) => {
        console.error('Service Worker registration failed', error);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [fetchDriveData]);

  return (
    <>
      <h1 className="text-2xl font-bold text-center mt-8">Money Map</h1>
      {/* Include your PWA updater */}
      <PwaUpdater />
      {/* Add more components here */}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DriveProvider clientId={clientId}>
      <RootApp />
    </DriveProvider>
  </React.StrictMode>
);
