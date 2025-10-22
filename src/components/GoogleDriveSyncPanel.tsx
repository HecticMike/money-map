import { formatDistanceToNow } from 'date-fns';
import type { DriveStatus } from '../contexts/DriveContext';

interface GoogleDriveSyncPanelProps {
  isEnabled: boolean;
  isAuthenticated: boolean;
  status: DriveStatus;
  lastSyncedAt: string | null;
  error: string | null;
  message: string | null;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onPush: () => void;
  onPull: () => void;
  onClearFeedback: () => void;
}

const statusTone: Record<DriveStatus, string> = {
  disabled: 'text-brand-highlight',
  idle: 'text-brand-highlight',
  authenticating: 'text-brand-neutral',
  syncing: 'text-brand-neutral',
  error: 'text-brand-accent',
  success: 'text-emerald-300'
};

export const GoogleDriveSyncPanel: React.FC<GoogleDriveSyncPanelProps> = ({
  isEnabled,
  isAuthenticated,
  status,
  lastSyncedAt,
  error,
  message,
  isSyncing,
  onLogin,
  onLogout,
  onPush,
  onPull,
  onClearFeedback
}) => {
  return (
    <section className="border border-brand-line bg-brand-ocean/80 px-4 py-5 text-brand-highlight shadow-panel sm:px-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-neutral sm:text-sm">
            Google Drive sync
          </h3>
          <p className="text-[11px] text-brand-neutral">
            Keep a JSON backup in Drive so your Money Map follows you everywhere.
          </p>
        </div>
        {isEnabled ? (
          <span
            className={`inline-flex items-center border border-brand-line bg-brand-midnight/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusTone[status]}`}
          >
            {status === 'authenticating'
              ? 'Authorising...'
              : status === 'syncing'
              ? 'Syncing...'
              : status === 'success'
              ? 'Up to date'
              : status === 'error'
              ? 'Needs attention'
              : isAuthenticated
              ? 'Connected'
              : 'Disconnected'}
          </span>
        ) : (
          <span className="inline-flex items-center border border-brand-accent bg-brand-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-accent">
            Disabled
          </span>
        )}
      </header>

      {!isEnabled ? (
        <div className="mt-5 space-y-3 text-[11px] text-brand-highlight">
          <p>
            Add <code className="border border-brand-line bg-brand-midnight px-1 font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> to your
            <code className="ml-1 border border-brand-line bg-brand-midnight px-1 font-mono text-[10px]">.env.local</code> to enable Drive synchronisation.
          </p>
          <ol className="space-y-1 text-[10px] text-brand-neutral">
            <li>1. Create an OAuth client for a web app in Google Cloud.</li>
            <li>2. Add your development URL (http://localhost:5173) to authorised JavaScript origins.</li>
            <li>3. Restart the dev server after updating environment variables.</li>
          </ol>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-3 text-[11px]">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center border border-brand-line bg-brand-midnight px-4 py-2 font-semibold text-brand-highlight transition hover:text-brand-amber"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center justify-center border border-brand-line bg-brand-highlight px-4 py-2 font-semibold text-brand-midnight transition hover:bg-brand-amber"
              >
                Connect Google Drive
              </button>
            )}
            <button
              type="button"
              onClick={onPush}
              disabled={!isAuthenticated || isSyncing}
              className="inline-flex items-center justify-center border border-brand-line bg-brand-highlight px-4 py-2 font-semibold text-brand-midnight transition hover:bg-brand-amber disabled:cursor-not-allowed disabled:bg-brand-slate/60"
            >
              Push to Drive
            </button>
            <button
              type="button"
              onClick={onPull}
              disabled={!isAuthenticated || isSyncing}
              className="inline-flex items-center justify-center border border-brand-line bg-brand-midnight px-4 py-2 font-semibold text-brand-highlight transition hover:text-brand-amber disabled:cursor-not-allowed disabled:text-brand-neutral/40"
            >
              Pull latest backup
            </button>
          </div>

          <div className="mt-6 space-y-2 text-[11px] text-brand-highlight">
            {lastSyncedAt != null ? (
              <p>
                Last synced{' '}
                <span className="font-semibold text-brand-neutral">
                  {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}
                </span>
              </p>
            ) : (
              <p>No Drive backup yet. Push your entries to create one.</p>
            )}
            {message != null ? (
              <div className="flex items-start justify-between gap-3 border border-brand-line bg-brand-midnight/80 px-4 py-3 text-[11px] text-brand-highlight">
                <span className="pr-2">{message}</span>
                <button
                  type="button"
                  onClick={onClearFeedback}
                  className="text-[10px] uppercase tracking-wide text-brand-neutral"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
            {error != null ? (
              <div className="flex items-start justify-between gap-3 border border-brand-line bg-brand-accent/15 px-4 py-3 text-[11px] text-brand-accent">
                <span className="pr-2">{error}</span>
                <button
                  type="button"
                  onClick={onClearFeedback}
                  className="text-[10px] uppercase tracking-wide"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
};
