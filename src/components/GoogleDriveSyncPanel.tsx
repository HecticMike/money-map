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
  disabled: 'text-slate-500',
  idle: 'text-slate-500',
  authenticating: 'text-amber-600',
  syncing: 'text-amber-600',
  error: 'text-rose-600',
  success: 'text-emerald-600'
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
    <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-card">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Google Drive sync</h3>
          <p className="text-sm text-slate-200">
            Keep a JSON backup in Drive so your Money Map follows you everywhere.
          </p>
        </div>
        {isEnabled ? (
          <span
            className={`inline-flex items-center rounded-full bg-slate-700/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone[status]}`}
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
          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-300">
            Disabled
          </span>
        )}
      </header>

      {!isEnabled ? (
        <div className="mt-6 space-y-3 text-sm text-slate-200">
          <p>
            Add <code className="rounded bg-slate-800 px-1 font-mono text-xs">VITE_GOOGLE_CLIENT_ID</code> to your
            <code className="rounded bg-slate-800 px-1 font-mono text-xs">.env.local</code> to enable Drive synchronisation.
          </p>
          <ol className="space-y-2 text-xs text-slate-300">
            <li>1. Create an OAuth client for a web app in Google Cloud.</li>
            <li>2. Add your development URL (http://localhost:5173) to authorised JavaScript origins.</li>
            <li>3. Restart the dev server after updating environment variables.</li>
          </ol>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Connect Google Drive
              </button>
            )}
            <button
              type="button"
              onClick={onPush}
              disabled={!isAuthenticated || isSyncing}
              className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Push to Drive
            </button>
            <button
              type="button"
              onClick={onPull}
              disabled={!isAuthenticated || isSyncing}
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-400"
            >
              Pull latest backup
            </button>
          </div>

          <div className="mt-6 space-y-2 text-sm text-slate-200">
            {lastSyncedAt != null ? (
              <p>
                Last synced{' '}
                <span className="font-semibold">
                  {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}
                </span>
              </p>
            ) : (
              <p>No Drive backup yet. Push your expenses to create one.</p>
            )}
            {message != null ? (
              <div className="flex items-start justify-between gap-3 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">
                <span>{message}</span>
                <button type="button" onClick={onClearFeedback} className="text-xs uppercase tracking-wide">
                  Dismiss
                </button>
              </div>
            ) : null}
            {error != null ? (
              <div className="flex items-start justify-between gap-3 rounded-xl bg-rose-500/20 px-4 py-3 text-sm text-rose-200">
                <span>{error}</span>
                <button type="button" onClick={onClearFeedback} className="text-xs uppercase tracking-wide">
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
