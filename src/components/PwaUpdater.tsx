import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PwaUpdater: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW: () => {
      // noop
    },
    onRegisterError: (error: unknown) => {
      console.error('PWA registration failed', error);
    }
  });

  useEffect(() => {
    let timeout: number | undefined;
    if (offlineReady) {
      timeout = window.setTimeout(() => {
        setOfflineReady(false);
      }, 5000);
    }
    return () => {
      if (timeout != null) {
        window.clearTimeout(timeout);
      }
    };
  }, [offlineReady, setOfflineReady]);

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm text-white shadow-xl shadow-slate-900/40">
      <span>
        {needRefresh ? 'New version available.' : 'Offline support ready.'}
      </span>
      <div className="flex gap-2">
        {needRefresh ? (
          <>
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white"
            >
              Later
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOfflineReady(false)}
            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
