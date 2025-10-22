// src/components/PwaUpdater.tsx
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useDriveContext } from '../contexts/DriveContext';

export const PwaUpdater: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW: () => {},
    onRegisterError: (error: any) => console.error('SW registration failed', error)
  });

  const { fetchDriveData } = useDriveContext();

  useEffect(() => {
    if (offlineReady || needRefresh) fetchDriveData?.();
  }, [offlineReady, needRefresh, fetchDriveData]);

  useEffect(() => {
    let timeout: number | undefined;
    if (offlineReady) {
      timeout = window.setTimeout(() => setOfflineReady(false), 5000);
    }
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [offlineReady, setOfflineReady]);

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border-4 border-pixel-border bg-pixel-abyss px-5 py-3 text-[10px] text-pixel-gold shadow-[0_12px_30px_rgba(5,10,34,0.6)]">
      <span>{needRefresh ? 'New version available.' : 'Offline support ready.'}</span>
      <div className="flex gap-2">
        {needRefresh ? (
          <>
            <button
              type="button"
              onClick={() => {
                updateServiceWorker(true);
                fetchDriveData?.();
                setNeedRefresh(false);
              }}
              className="rounded-full border-2 border-pixel-border bg-pixel-amber px-3 py-1 text-[10px] font-semibold text-pixel-midnight transition hover:bg-pixel-gold"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="rounded-full border-2 border-pixel-border bg-pixel-abyss/80 px-3 py-1 text-[10px] font-semibold text-pixel-gold transition hover:border-pixel-amber hover:text-pixel-amber"
            >
              Later
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOfflineReady(false)}
            className="rounded-full border-2 border-pixel-border bg-pixel-abyss/80 px-3 py-1 text-[10px] font-semibold text-pixel-gold transition hover:border-pixel-amber hover:text-pixel-amber"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
