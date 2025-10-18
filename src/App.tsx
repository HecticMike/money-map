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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 pb-24">
      <PwaUpdater />
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-500">Money Map</p>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              A money map in your hands.
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-medium text-slate-500">
            <a href="#capture" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              Capture
            </a>
            <a href="#insights" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              Insights
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

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pt-10">
        <section
          id="capture"
          className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl shadow-slate-900/20 lg:p-10"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {isEditing ? "Update your log instantly" : "Log money in seconds"}
              </h2>
              <p className="mt-3 max-w-xl text-base text-slate-200">
                Add a new expense or adjust a recent entry right from the top of the app. Quick capture keeps Money Map
                up to date, and every change can sync straight to Google Drive.
              </p>
              <div className="mt-6 flex flex-col gap-3 text-sm text-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">Preferred currency</span>
                <div className="inline-flex rounded-full bg-white/10 p-1 text-sm font-semibold">
                  {CURRENCY_SELECT_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleCurrencyToggle(option.code)}
                      className={`rounded-full px-4 py-2 transition ${
                        currency === option.code
                          ? "bg-white text-slate-900 shadow-lg"
                          : "text-slate-200 hover:text-white"
                      }`}
                      aria-pressed={currency === option.code}
                    >
                      {option.code}
                    </button>
                  ))}
                </div>
                <ul className="mt-2 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <li className="rounded-full border border-white/20 px-3 py-1">{currencyMeta.symbol} entries</li>
                  <li className="rounded-full border border-white/20 px-3 py-1">Autosave</li>
                  <li className="rounded-full border border-white/20 px-3 py-1">Drive backup</li>
                </ul>
              </div>
            </div>
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {isEditing ? "Edit entry" : "Add an entry"}
                </h3>
                {isEditing ? (
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
                mode={isEditing ? "edit" : "create"}
                initialExpense={editingExpense}
                onSubmit={isEditing ? handleUpdateExpense : handleCreateExpense}
                onCancel={() => setEditingExpense(null)}
                currencySymbol={currencyMeta.symbol}
              />
            </div>
          </div>
        </section>

        <section id="insights" className="space-y-6">
          <SummaryGrid stats={stats} expenses={expenses} formatAmount={format} currencyLabel={currencyLabel} />
          <SpendingCharts stats={stats} formatAmount={format} />
        </section>

        <section className="grid gap-8 lg:grid-cols-3" id="activity">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
                <span className="text-sm text-slate-400">{expenses.length} logged</span>
              </div>
              <ExpenseList
                expenses={expenses}
                onEdit={(expense) => setEditingExpense(expense)}
                onDelete={handleDeleteExpense}
                formatAmount={format}
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
                Money Map works without a connection, saving updates to local storage and syncing when you&apos;re ready.
                Install it as a Progressive Web App for a native, on-the-go experience that fits an iPhone or your
                daily laptop setup.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
