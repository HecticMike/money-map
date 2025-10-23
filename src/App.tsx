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
import { downloadExpensesFromDrive, uploadExpensesToDrive, ensureDriveFile } from './utils/googleDrive';
import { useCurrency, CURRENCY_SELECT_OPTIONS, type SupportedCurrency } from './hooks/useCurrency';

const navItems = [
  { id: 'capture', label: 'Capture' },
  { id: 'insights', label: 'Insights' },
  { id: 'activity', label: 'Activity' },
  { id: 'drive', label: 'Backup' }
];

export const App: React.FC = () => {
  const {
    expenses,
    stats,
    incomeTotal,
    expenseTotal,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceExpenses
  } = useExpenses();
  const drive = useDriveContext();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { currency, setCurrency, meta: currencyMeta, format } = useCurrency();

  const currencyLabel =
    CURRENCY_SELECT_OPTIONS.find((option) => option.code === currency)?.label ?? currency;
  const isEditing = editingExpense != null;

  const handleCurrencyToggle = (code: SupportedCurrency) => {
    setCurrency(code);
  };

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
    const confirmed = window.confirm(`Delete ${expense.note || 'this entry'}?`);
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
    if (drive.accessToken == null) {
      drive.setError('Access token missing. Please reconnect Google Drive.');
      return;
    }
    setIsSyncing(true);
    drive.setStatus('syncing');
    try {
      const fileId =
        drive.fileId ??
        (await ensureDriveFile({
          accessToken: drive.accessToken,
          fileId: null,
          fileName: 'money-map-data.json'
        }));

      const remote = await downloadExpensesFromDrive({
        accessToken: drive.accessToken,
        fileId
      });
      replaceExpenses(remote.expenses);
      drive.setFileId(fileId);
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
    <div className="min-h-screen bg-gradient-to-br from-brand-midnight via-brand-ocean to-brand-midnight text-brand-highlight font-sans">
      <PwaUpdater />
      <main className="mx-auto max-w-5xl px-3 py-8 space-y-6 text-brand-highlight md:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center border border-brand-highlight bg-brand-highlight text-2xl font-semibold text-brand-midnight md:h-16 md:w-16 md:text-3xl">
              M
            </div>
            <h1 className="text-3xl font-semibold text-brand-highlight md:text-4xl">Money Map</h1>
          </div>
          <div className="flex items-center gap-3 border border-brand-line bg-brand-ocean/60 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-brand-highlight md:text-xs">
            <span className="text-brand-neutral">Currency</span>
            <div className="flex gap-2">
              {CURRENCY_SELECT_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleCurrencyToggle(option.code)}
                  className={`px-3 py-1 transition ${
                    currency === option.code
                      ? 'bg-brand-highlight text-brand-midnight'
                      : 'border border-brand-line text-brand-highlight hover:text-brand-amber'
                  }`}
                  aria-pressed={currency === option.code}
                >
                  {option.code}
                </button>
              ))}
            </div>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-brand-highlight md:text-xs">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="border border-brand-line/0 px-3 py-1.5 transition hover:border-brand-highlight hover:text-brand-amber"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <section
          id="capture"
          className="border border-brand-line bg-brand-ocean/75 px-4 py-5 shadow-panel sm:px-5"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
            <div className="space-y-3 text-brand-highlight">
              <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-brand-amber md:text-xl">
                {isEditing ? 'Edit entry' : 'Add money entry'}
              </h2>
              <p className="max-w-sm text-xs text-brand-neutral">
                Log income and outgoings quickly to keep your map up to date.
              </p>
            </div>
            <div className="border border-brand-line bg-brand-midnight/90 px-4 py-5">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-brand-neutral">
                <span>{isEditing ? 'Edit entry' : 'Add an entry'}</span>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => setEditingExpense(null)}
                    className="text-brand-accent hover:text-brand-highlight"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
              <ExpenseForm
                mode={isEditing ? 'edit' : 'create'}
                initialExpense={editingExpense}
                onSubmit={isEditing ? handleUpdateExpense : handleCreateExpense}
                onCancel={() => setEditingExpense(null)}
                currencySymbol={currencyMeta.symbol}
              />
            </div>
          </div>
        </section>

        <section id="insights" className="space-y-4 text-brand-highlight">
          <h2 className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-amber">
            Insights
          </h2>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
            <div className="border border-brand-line bg-brand-ocean/80 px-4 py-5 overflow-hidden">
              <SummaryGrid
                stats={stats}
                expenses={expenses}
                formatAmount={format}
                currencyLabel={currencyLabel}
                incomeTotal={incomeTotal}
                expenseTotal={expenseTotal}
              />
            </div>
            <div className="border border-brand-line bg-brand-ocean/80 px-4 py-4">
              <SpendingCharts stats={stats} formatAmount={format} />
            </div>
          </div>
        </section>

        <section id="activity" className="space-y-4 text-brand-highlight">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-amber">
              Activity
            </h2>
            <span className="border border-brand-line bg-brand-ocean/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-highlight">
              {expenses.length} entries
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="border border-brand-line bg-brand-ocean/80 px-4 py-5">
              <ExpenseList
                expenses={expenses}
                onEdit={(expense) => setEditingExpense(expense)}
                onDelete={handleDeleteExpense}
                formatAmount={format}
              />
            </div>
            <div className="space-y-4">
              <section
                id="drive"
                className="border border-brand-line bg-brand-ocean/80 px-4 py-5 shadow-panel"
              >
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
              </section>
              <section className="border border-brand-line bg-brand-ocean/80 px-4 py-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-amber">
                  Made for the road
                </h3>
                <p className="mt-3 text-[11px] text-brand-neutral">
                  Install Money Map to your home screen for quick, offline access and sync updates whenever you connect.
                </p>
              </section>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border border-brand-line bg-brand-ocean/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-highlight md:flex-row md:items-center md:justify-between md:text-xs">
          <span>Money Map · {currencyMeta.label}</span>
          <span className="text-brand-accent">Offline ready · Drive sync secured</span>
        </footer>
      </main>
    </div>
  );
};

export default App;
