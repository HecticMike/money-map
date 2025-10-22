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
    <div className="fixed inset-x-0 bottom-4 mx-auto flex max-w-md items-center justify-between gap-3 border border-brand-line bg-brand-ocean/90 px-5 py-3 text-[11px] text-brand-highlight shadow-panel">
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
              className="border border-brand-line bg-brand-highlight px-3 py-1 text-[11px] font-semibold text-brand-midnight transition hover:bg-brand-amber"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="border border-brand-line bg-brand-midnight px-3 py-1 text-[11px] font-semibold text-brand-highlight transition hover:text-brand-amber"
            >
              Later
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOfflineReady(false)}
            className="border border-brand-line bg-brand-midnight px-3 py-1 text-[11px] font-semibold text-brand-highlight transition hover:text-brand-amber"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
