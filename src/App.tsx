import { useMemo, useState } from 'react';
import { formatISO, parseISO, startOfDay, startOfMonth, startOfYear, subMonths } from 'date-fns';
import { CATEGORY_META, type Expense, type ExpenseDraft, type ExpenseStats } from './types';
import { ExpenseForm } from './components/ExpenseForm';
import { SummaryGrid } from './components/SummaryGrid';
import { SpendingCharts } from './components/SpendingCharts';
import { ExpenseList } from './components/ExpenseList';
import { ActivityFilters, type ActivityFiltersState } from './components/ActivityFilters';
import { GoogleDriveSyncPanel } from './components/GoogleDriveSyncPanel';
import { PwaUpdater } from './components/PwaUpdater';
import { useExpenses } from './hooks/useExpenses';
import { useDriveContext, DRIVE_FILE_TITLE } from './contexts/DriveContext';
import { downloadExpensesFromDrive, uploadExpensesToDrive, ensureDriveFile } from './utils/googleDrive';
import { exportExpensesToExcel } from './utils/exportToExcel';
import { useCurrency, CURRENCY_SELECT_OPTIONS, type SupportedCurrency } from './hooks/useCurrency';

const navItems = [
  { id: 'capture', label: 'Capture' },
  { id: 'insights', label: 'Insights' },
  { id: 'activity', label: 'Activity' },
  { id: 'drive', label: 'Backup' }
];

const INSIGHTS_RANGE_OPTIONS = [
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
  { id: 'ytd', label: 'YTD' },
  { id: 'all', label: 'All' }
] as const;

type InsightsRange = (typeof INSIGHTS_RANGE_OPTIONS)[number]['id'];

const createDefaultActivityFilters = (): ActivityFiltersState => ({
  query: '',
  type: 'all',
  category: 'all'
});

const getInsightsRangeStart = (range: InsightsRange): Date | null => {
  const now = new Date();
  switch (range) {
    case '1m':
      return startOfDay(subMonths(now, 1));
    case '3m':
      return startOfDay(subMonths(now, 3));
    case '6m':
      return startOfDay(subMonths(now, 6));
    case 'ytd':
      return startOfYear(now);
    case 'all':
    default:
      return null;
  }
};

export const App: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, replaceExpenses } = useExpenses();
  const drive = useDriveContext();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { currency, setCurrency, meta: currencyMeta, format } = useCurrency();
  const [insightsRange, setInsightsRange] = useState<InsightsRange>('1m');
  const [activityFilters, setActivityFilters] = useState<ActivityFiltersState>(() =>
    createDefaultActivityFilters()
  );
  const insightsExpenses = useMemo(() => {
    const start = getInsightsRangeStart(insightsRange);
    if (start == null) return expenses;
    return expenses.filter((expense) => {
      const date = new Date(expense.date);
      if (Number.isNaN(date.getTime())) return false;
      return date >= start;
    });
  }, [expenses, insightsRange]);
  const insightsStats = useMemo<ExpenseStats>(() => {
    const byCategory = Object.keys(CATEGORY_META).reduce<Record<string, number>>((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    const monthlyMap = new Map<string, number>();
    let total = 0;

    insightsExpenses.forEach((expense) => {
      const amount = Number(expense.amount);
      total += amount;
      byCategory[expense.category] = (byCategory[expense.category] ?? 0) + amount;

      const monthKey = formatISO(startOfMonth(parseISO(expense.date)));
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + amount);
    });

    const monthlyTotals = Array.from(monthlyMap.entries())
      .map(([month, value]) => ({
        month,
        total: value
      }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

    return {
      total,
      byCategory: byCategory as ExpenseStats['byCategory'],
      monthlyTotals
    };
  }, [insightsExpenses]);
  const insightsIncomeTotal = useMemo(
    () =>
      insightsExpenses.reduce((sum, entry) => {
        return CATEGORY_META[entry.category].type === 'income' ? sum + entry.amount : sum;
      }, 0),
    [insightsExpenses]
  );
  const insightsExpenseTotal = useMemo(
    () =>
      insightsExpenses.reduce((sum, entry) => {
        return CATEGORY_META[entry.category].type === 'expense' ? sum + entry.amount : sum;
      }, 0),
    [insightsExpenses]
  );
  const filteredExpenses = useMemo(() => {
    const query = activityFilters.query.trim().toLowerCase();

    return expenses.filter((expense) => {
      if (activityFilters.type !== 'all') {
        const isIncome = CATEGORY_META[expense.category].type === 'income';
        if (activityFilters.type === 'income' && !isIncome) return false;
        if (activityFilters.type === 'expense' && isIncome) return false;
      }

      if (activityFilters.category !== 'all' && expense.category !== activityFilters.category) {
        return false;
      }

      if (query.length > 0) {
        const noteText = expense.note.toLowerCase();
        const categoryLabel = CATEGORY_META[expense.category].label.toLowerCase();
        return noteText.includes(query) || categoryLabel.includes(query);
      }

      return true;
    });
  }, [expenses, activityFilters]);
  const hasActiveFilters =
    activityFilters.type !== 'all' ||
    activityFilters.category !== 'all' ||
    activityFilters.query.trim().length > 0;
  const activityCountLabel = hasActiveFilters
    ? `${filteredExpenses.length} of ${expenses.length} entries`
    : `${expenses.length} entries`;

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

  const handleInsightsRangeChange = (range: InsightsRange) => {
    setInsightsRange(range);
  };

  const handleActivityFiltersChange = (updates: Partial<ActivityFiltersState>) => {
    setActivityFilters((previous) => ({
      ...previous,
      ...updates
    }));
  };

  const handleResetActivityFilters = () => {
    setActivityFilters(createDefaultActivityFilters());
  };

  const handleExportActivity = () => {
    if (filteredExpenses.length === 0) return;
    exportExpensesToExcel(filteredExpenses, {
      currencyLabel: currencyMeta.label,
      currencyCode: currency
    });
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
          <h1 className="text-3xl font-semibold text-brand-highlight md:text-4xl">Money Map</h1>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-amber">
              Insights
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em]">
              {INSIGHTS_RANGE_OPTIONS.map((option) => {
                const isActive = insightsRange === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleInsightsRangeChange(option.id)}
                    aria-pressed={isActive}
                    className={`border px-3 py-1 transition ${
                      isActive
                        ? 'border-brand-highlight bg-brand-highlight text-brand-midnight'
                        : 'border-brand-line text-brand-highlight hover:border-brand-highlight hover:text-brand-amber'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
            <div className="border border-brand-line bg-brand-ocean/80 px-4 py-5 overflow-hidden">
              <SummaryGrid
                stats={insightsStats}
                expenses={insightsExpenses}
                formatAmount={format}
                currencyLabel={currencyLabel}
                incomeTotal={insightsIncomeTotal}
                expenseTotal={insightsExpenseTotal}
              />
            </div>
            <div className="border border-brand-line bg-brand-ocean/80 px-4 py-4">
              <SpendingCharts stats={insightsStats} formatAmount={format} />
            </div>
          </div>
        </section>

        <section id="activity" className="space-y-4 text-brand-highlight">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-amber">
              Activity
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="border border-brand-line bg-brand-ocean/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-highlight">
                {activityCountLabel}
              </span>
              <button
                type="button"
                onClick={handleExportActivity}
                disabled={filteredExpenses.length === 0}
                className="border border-brand-line bg-brand-highlight px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-midnight transition hover:bg-brand-amber disabled:cursor-not-allowed disabled:bg-brand-slate/50 disabled:text-brand-midnight/60"
              >
                Export to Excel
              </button>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4 border border-brand-line bg-brand-ocean/80 px-4 py-5">
              <ActivityFilters
                value={activityFilters}
                onChange={handleActivityFiltersChange}
                onReset={handleResetActivityFilters}
              />
              <ExpenseList
                expenses={filteredExpenses}
                onEdit={(expense) => setEditingExpense(expense)}
                onDelete={handleDeleteExpense}
                formatAmount={format}
                emptyMessage={
                  hasActiveFilters ? 'No entries match the current filters.' : undefined
                }
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
