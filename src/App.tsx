import { useState } from 'react';
import type { Expense, ExpenseDraft } from './types';
import { ExpenseForm } from './components/ExpenseForm';
import { SummaryGrid } from './components/SummaryGrid';
import { SpendingCharts } from './components/SpendingCharts';
import { ExpenseList } from './components/ExpenseList';
import { GoogleDriveSyncPanel } from './components/GoogleDriveSyncPanel';
import { PwaUpdater } from './components/PwaUpdater';
import { useExpenses } from './hooks/useExpenses';
import { useDriveContext, DRIVE_FILE_TITLE } from './contexts/DriveContext';
import { downloadExpensesFromDrive, uploadExpensesToDrive } from './utils/googleDrive';

export const App: React.FC = () => {
  const { expenses, stats, addExpense, updateExpense, deleteExpense, replaceExpenses } = useExpenses();
  const drive = useDriveContext();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCreateExpense = (draft: ExpenseDraft) => {
    addExpense(draft);
  };

  const handleUpdateExpense = (draft: ExpenseDraft) => {
    if (editingExpense == null) return;
    updateExpense(editingExpense.id, {
      amount: draft.amount,
      category: draft.category,
      date: draft.date,
      note: draft.note
    });
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expense: Expense) => {
    const confirmed = window.confirm(`Delete ${expense.note || 'this expense'}?`);
    if (confirmed) {
      deleteExpense(expense.id);
    }
  };

  const ensureAuthenticated = () => {
    if (!drive.isEnabled) return false;
    if (!drive.isAuthenticated) {
      drive.login();
      return false;
    }
    return true;
  };

  const handlePushToDrive = async () => {
    if (!ensureAuthenticated()) return;
    if (drive.accessToken == null) {
      drive.setError('Access token missing. Please connect again.');
      return;
    }
    setIsSyncing(true);
    drive.setStatus('syncing');
    try {
      const syncedAt = new Date().toISOString();
      const result = await uploadExpensesToDrive({
        accessToken: drive.accessToken,
        fileId: drive.fileId,
        payload: {
          expenses,
          syncedAt,
          version: 1
        }
      });
      drive.setFileId(result.fileId);
      drive.setLastSyncedAt(result.modifiedTime ?? syncedAt);
      drive.setStatus('success');
      setMessage(`Synced to Google Drive as ${DRIVE_FILE_TITLE}.`);
      drive.setError(null);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unexpected sync error.';
      drive.setStatus('error');
      drive.setError(reason);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromDrive = async () => {
    if (!ensureAuthenticated()) return;
    if (drive.accessToken == null || drive.fileId == null) {
      drive.setError('No backup found yet. Push your expenses to create one.');
      return;
    }
    setIsSyncing(true);
    drive.setStatus('syncing');
    try {
      const remote = await downloadExpensesFromDrive({
        accessToken: drive.accessToken,
        fileId: drive.fileId
      });
      replaceExpenses(remote.expenses);
      drive.setLastSyncedAt(remote.syncedAt);
      drive.setStatus('success');
      setMessage('Latest backup imported from Drive.');
      drive.setError(null);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unable to download backup.';
      drive.setStatus('error');
      drive.setError(reason);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearFeedback = () => {
    setMessage(null);
    drive.setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 pb-24">
      <PwaUpdater />
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-500">Money map</p>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Visualise your spending, own your future.
            </h1>
          </div>
          <nav className="flex gap-2 text-sm font-medium text-slate-500">
            <a href="#overview" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              Overview
            </a>
            <a href="#activity" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              Activity
            </a>
            <a href="#drive" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              Backup
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pt-10" id="overview">
        <section className="space-y-6">
          <SummaryGrid stats={stats} expenses={expenses} />
          <SpendingCharts stats={stats} />
        </section>

        <section className="grid gap-8 lg:grid-cols-3" id="activity">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingExpense ? 'Edit expense' : 'Log a new expense'}
                </h2>
                {editingExpense ? (
                  <button
                    type="button"
                    onClick={() => setEditingExpense(null)}
                    className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Cancel editing
                  </button>
                ) : null}
              </div>
              <ExpenseForm
                mode={editingExpense ? 'edit' : 'create'}
                initialExpense={editingExpense}
                onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
                onCancel={() => setEditingExpense(null)}
              />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Recent expenses</h2>
                <span className="text-sm text-slate-400">{expenses.length} logged</span>
              </div>
              <ExpenseList
                expenses={expenses}
                onEdit={(expense) => setEditingExpense(expense)}
                onDelete={handleDeleteExpense}
              />
            </div>
          </div>
          <div className="space-y-6" id="drive">
            <GoogleDriveSyncPanel
              isEnabled={drive.isEnabled}
              isAuthenticated={drive.isAuthenticated}
              status={drive.status}
              lastSyncedAt={drive.lastSyncedAt}
              error={drive.error}
              message={message}
              isSyncing={isSyncing}
              onLogin={drive.login}
              onLogout={drive.logout}
              onPush={handlePushToDrive}
              onPull={handlePullFromDrive}
              onClearFeedback={clearFeedback}
            />
            <section className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="text-lg font-semibold text-slate-900">Offline-first by design</h3>
              <p className="mt-3 text-sm text-slate-500">
                Money Map works without a connection, saving updates to local storage and syncing when you&apos;re
                ready. Install it as a Progressive Web App for a native, on-the-go experience that fits an iPhone 15
                or your daily laptop setup.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
