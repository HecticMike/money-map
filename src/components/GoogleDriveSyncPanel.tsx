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
  disabled: 'text-pixel-gold',
  idle: 'text-pixel-gold',
  authenticating: 'text-pixel-cyan',
  syncing: 'text-pixel-cyan',
  error: 'text-pixel-red',
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
    <section className="rounded-2xl border-4 border-pixel-border bg-pixel-abyss/85 p-5 text-pixel-gold shadow-[0_20px_50px_rgba(5,10,34,0.55)] sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-pixel-amber sm:text-sm">
            Google Drive sync
          </h3>
          <p className="text-[11px] text-pixel-gold">
            Keep a JSON backup in Drive so your Money Map follows you everywhere.
          </p>
        </div>
        {isEnabled ? (
          <span
            className={`inline-flex items-center rounded-full border-2 border-pixel-border bg-pixel-dusk/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusTone[status]}`}
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
          <span className="inline-flex items-center rounded-full border-2 border-pixel-red bg-pixel-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-pixel-red">
            Disabled
          </span>
        )}
      </header>

      {!isEnabled ? (
        <div className="mt-6 space-y-3 text-[11px] text-pixel-gold">
          <p>
            Add <code className="rounded border border-pixel-border bg-pixel-midnight px-1 font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> to your
            <code className="ml-1 rounded border border-pixel-border bg-pixel-midnight px-1 font-mono text-[10px]">.env.local</code> to enable Drive synchronisation.
          </p>
          <ol className="space-y-1 text-[10px] text-pixel-cyan">
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
                className="inline-flex items-center justify-center rounded-lg border-2 border-pixel-border bg-pixel-dusk/80 px-4 py-2 font-semibold text-pixel-gold transition hover:border-pixel-amber hover:text-pixel-amber"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center justify-center rounded-lg border-2 border-pixel-border bg-pixel-amber px-4 py-2 font-semibold text-pixel-midnight transition hover:bg-pixel-gold"
              >
                Connect Google Drive
              </button>
            )}
            <button
              type="button"
              onClick={onPush}
              disabled={!isAuthenticated || isSyncing}
              className="inline-flex items-center justify-center rounded-lg border-2 border-pixel-border bg-pixel-amber px-4 py-2 font-semibold text-pixel-midnight transition hover:bg-pixel-gold disabled:cursor-not-allowed disabled:border-pixel-border disabled:bg-pixel-dusk disabled:text-pixel-gold/40"
            >
              Push to Drive
            </button>
            <button
              type="button"
              onClick={onPull}
              disabled={!isAuthenticated || isSyncing}
              className="inline-flex items-center justify-center rounded-lg border-2 border-pixel-border bg-pixel-dusk/80 px-4 py-2 font-semibold text-pixel-gold transition hover:border-pixel-amber hover:text-pixel-amber disabled:cursor-not-allowed disabled:border-pixel-border disabled:text-pixel-gold/40"
            >
              Pull latest backup
            </button>
          </div>

          <div className="mt-6 space-y-2 text-[11px] text-pixel-gold">
            {lastSyncedAt != null ? (
              <p>
                Last synced{' '}
                <span className="font-semibold text-pixel-amber">
                  {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}
                </span>
              </p>
            ) : (
              <p>No Drive backup yet. Push your entries to create one.</p>
            )}
            {message != null ? (
              <div className="flex items-start justify-between gap-3 rounded-lg border-2 border-pixel-border bg-emerald-500/15 px-4 py-3 text-[11px] text-emerald-200">
                <span className="pr-2">{message}</span>
                <button type="button" onClick={onClearFeedback} className="text-[10px] uppercase tracking-wide text-pixel-cyan">
                  Dismiss
                </button>
              </div>
            ) : null}
            {error != null ? (
              <div className="flex items-start justify-between gap-3 rounded-lg border-2 border-pixel-border bg-pixel-red/20 px-4 py-3 text-[11px] text-pixel-red">
                <span className="pr-2">{error}</span>
                <button type="button" onClick={onClearFeedback} className="text-[10px] uppercase tracking-wide text-pixel-red">
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
