import { useState } from "react";
import type { Expense, ExpenseDraft } from "./types";
import { ExpenseForm } from "./components/ExpenseForm";
import { SummaryGrid } from "./components/SummaryGrid";
import { SpendingCharts } from "./components/SpendingCharts";
import { ExpenseList } from "./components/ExpenseList";
import { GoogleDriveSyncPanel } from "./components/GoogleDriveSyncPanel";
import { PwaUpdater } from "./components/PwaUpdater";
import { useExpenses } from "./hooks/useExpenses";
import { useDriveContext, DRIVE_FILE_TITLE } from "./contexts/DriveContext";
import { downloadExpensesFromDrive, uploadExpensesToDrive } from "./utils/googleDrive";
import { useCurrency, CURRENCY_SELECT_OPTIONS, type SupportedCurrency } from "./hooks/useCurrency";

export const App: React.FC = () => {
  const { expenses, stats, addExpense, updateExpense, deleteExpense, replaceExpenses } = useExpenses();
  const drive = useDriveContext();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { currency, setCurrency, meta: currencyMeta, format } = useCurrency();

  const currencyLabel = CURRENCY_SELECT_OPTIONS.find((option) => option.code === currency)?.label ?? currency;
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
    const confirmed = window.confirm(`Delete ${expense.note || "this entry"}?`);
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
      drive.setError("Access token missing. Please connect again.");
      return;
    }
    setIsSyncing(true);
    drive.setStatus("syncing");
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
      drive.setStatus("success");
      setMessage(`Synced to Google Drive as ${DRIVE_FILE_TITLE}.`);
      drive.setError(null);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unexpected sync error.";
      drive.setStatus("error");
      drive.setError(reason);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromDrive = async () => {
    if (!ensureAuthenticated()) return;
    if (drive.accessToken == null || drive.fileId == null) {
      drive.setError("No backup found yet. Push your entries to create one.");
      return;
    }
    setIsSyncing(true);
    drive.setStatus("syncing");
    try {
      const remote = await downloadExpensesFromDrive({
        accessToken: drive.accessToken,
        fileId: drive.fileId
      });
      replaceExpenses(remote.expenses);
      drive.setLastSyncedAt(remote.syncedAt);
      drive.setStatus("success");
      setMessage("Latest backup imported from Drive.");
      drive.setError(null);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unable to download backup.";
      drive.setStatus("error");
      drive.setError(reason);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearFeedback = () => {
    setMessage(null);
    drive.setError(null);
  };

  const navItems = [
    { id: "capture", label: "Capture" },
    { id: "insights", label: "Insights" },
    { id: "activity", label: "Activity" },
    { id: "drive", label: "Backup" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <PwaUpdater />
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10 md:px-8">
        <div className="relative flex flex-1 flex-col gap-10 rounded-[32px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl shadow-[0_40px_120px_rgba(15,23,42,0.55)] md:p-10">
          <header className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-400/80">Money Map</p>
                <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">Money Map</h1>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-200 shadow-inner shadow-black/30">
                <span className="uppercase tracking-wide text-xs text-slate-300">Currency</span>
                <div className="inline-flex rounded-full border border-white/10 bg-slate-900/40 p-1">
                  {CURRENCY_SELECT_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleCurrencyToggle(option.code)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        currency === option.code ? "bg-sky-400 text-slate-950 shadow-lg" : "text-slate-300 hover:text-white"
                      }`}
                      aria-pressed={currency === option.code}
                    >
                      {option.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <nav className="flex items-center justify-between rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-inner shadow-black/20 sm:text-sm">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-full px-3 py-2 text-slate-300 transition hover:bg-sky-400/20 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>

          <section
            id="capture"
            className="relative rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.45)] md:p-10"
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                  {isEditing ? "Edit entry" : "Add money entry"}
                </h2>
                <p className="max-w-sm text-sm text-slate-300">
                  Stay on top of income and outgoings in a couple of taps.
                </p>
              </div>
              <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-100">{isEditing ? "Edit entry" : "Add an entry"}</h3>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => setEditingExpense(null)}
                      className="text-sm font-semibold text-slate-300 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
                <ExpenseForm
                  mode={isEditing ? "edit" : "create"}
                  initialExpense={editingExpense}
                  onSubmit={isEditing ? handleUpdateExpense : handleCreateExpense}
                  onCancel={() => setEditingExpense(null)}
                  currencySymbol={currencyMeta.symbol}
                />
              </div>
            </div>
          </section>

          <section id="insights" className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold tracking-wide text-slate-200 uppercase">Insights</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <SummaryGrid stats={stats} expenses={expenses} formatAmount={format} currencyLabel={currencyLabel} />
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-white/5">
                <SpendingCharts stats={stats} formatAmount={format} />
              </div>
            </div>
          </section>

          <section id="activity" className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-wide text-slate-200 uppercase">Activity</h2>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-300">
                {expenses.length} entries
              </span>
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-white/5">
                <ExpenseList
                  expenses={expenses}
                  onEdit={(expense) => setEditingExpense(expense)}
                  onDelete={handleDeleteExpense}
                  formatAmount={format}
                />
              </div>
              <div className="space-y-6">
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
                <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-white/5">
                  <h3 className="text-lg font-semibold text-slate-100">Made for the road</h3>
                  <p className="mt-3 text-sm text-slate-300">
                    Install Money Map to your home screen for a native-like experience. Works offline, saves safely to local storage, and syncs to Drive when you reconnect.
                  </p>
                </section>
              </div>
            </div>
          </section>

          <footer className="mt-auto flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-inner shadow-black/20 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span>Money Map · {currencyMeta.label}</span>
            <span>Offline ready - Drive sync secured</span>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
