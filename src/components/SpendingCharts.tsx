import { useEffect, useMemo, useState } from 'react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORY_META, type ExpenseCategory, type ExpenseStats } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.color = '#facc15';
ChartJS.defaults.font = {
  family: '"Space Grotesk", sans-serif',
  size: 11
};

interface SpendingChartsProps {
  stats: ExpenseStats;
  formatAmount: (value: number) => string;
}

type LegendEntry = {
  key: ExpenseCategory;
  label: string;
  color: string;
  value: number;
  percent: number;
};

export const SpendingCharts: React.FC<SpendingChartsProps> = ({ stats, formatAmount }) => {
  const { chartData, legend } = useMemo(() => {
    const entries = (Object.entries(stats.byCategory) as Array<[ExpenseCategory, number]>)
      .map(([key, value]) => {
        const meta = CATEGORY_META[key];
        return {
          key,
          label: meta.label,
          color: meta.color,
          type: meta.type,
          value: Number(value.toFixed(2))
        };
      })
      .filter((entry) => entry.type === 'expense' && entry.value > 0);

    const total = entries.reduce((sum, item) => sum + item.value, 0);
    const sorted: LegendEntry[] = entries
      .map((item) => ({
        key: item.key,
        label: item.label,
        color: item.color,
        value: item.value,
        percent: total === 0 ? 0 : Math.round((item.value / total) * 100)
      }))
      .filter((item) => item.percent > 0)
      .sort((a, b) => b.value - a.value);

    return {
      chartData:
        sorted.length > 0
          ? {
              labels: sorted.map((item) => item.label),
              datasets: [
                {
                  label: 'Spending breakdown',
                  data: sorted.map((item) => item.value),
                  backgroundColor: sorted.map((item) => item.color),
                  borderWidth: 1,
                  borderColor: '#1f2647'
                }
              ]
            }
          : null,
      legend: sorted
    };
  }, [stats.byCategory]);
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);

  const categoryChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label ?? '';
              const value = typeof context.parsed === 'number' ? context.parsed : 0;
              return `${label}: ${formatAmount(value)}`;
            }
          },
          backgroundColor: '#1f2647',
          borderColor: '#facc15',
          borderWidth: 1,
          titleColor: '#facc15',
          bodyColor: '#fef3c7'
        }
      },
      cutout: '65%'
    }),
    [formatAmount]
  );

  const trackedMonths = stats.monthlyTotals.length;
  const monthCount = trackedMonths > 0 ? trackedMonths : 1;

  const areArraysEqual = (a: ExpenseCategory[], b: ExpenseCategory[]) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

  useEffect(() => {
    setSelectedCategories((previous) => {
      const availableKeys = legend.map((item) => item.key);
      const filtered = previous.filter((key) => availableKeys.includes(key));
      if (filtered.length > 0) {
        return areArraysEqual(filtered, previous) ? previous : filtered;
      }
      const defaults = availableKeys.slice(0, Math.min(3, availableKeys.length));
      if (defaults.length === 0) {
        return previous.length === 0 ? previous : [];
      }
      return areArraysEqual(defaults, previous) ? previous : defaults;
    });
  }, [legend]);

  const handleToggleCategory = (category: ExpenseCategory) => {
    setSelectedCategories((previous) => {
      if (previous.includes(category)) {
        return previous.filter((key) => key !== category);
      }
      return [...previous, category];
    });
  };

  const selectedAverageEntries = legend.filter((entry) => selectedCategories.includes(entry.key));
  const averageEntries = selectedAverageEntries.map((entry) => ({
    ...entry,
    average: entry.value / monthCount
  }));

  return (
    <div className="grid gap-4">
      <div className="border border-brand-line bg-brand-ocean/80 px-3 py-4 sm:px-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-amber sm:text-sm">
          Spending breakdown
        </h3>
        {legend.length > 0 && chartData != null ? (
          <>
            <div className="mt-4 flex justify-center">
              <div className="h-48 w-48">
                <Doughnut data={chartData} options={categoryChartOptions} />
              </div>
            </div>
            <ul className="mt-4 grid gap-2 text-[11px] text-brand-highlight">
              {legend.map((item) => (
                <li key={item.key} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 border border-brand-line"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-brand-neutral">{item.percent}%</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-4 text-[11px] text-brand-highlight">
            Categorise expenses to see where your money flows.
          </p>
        )}
      </div>
      <div className="border border-brand-line bg-brand-ocean/80 px-3 py-4 sm:px-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-amber sm:text-sm">
          Average per month
        </h3>
        {legend.length > 0 ? (
          <>
            <p className="mt-2 text-[11px] text-brand-neutral">
              Based on {trackedMonths || 1} month{(trackedMonths || 1) === 1 ? '' : 's'} of activity.
              Toggle categories to customise the view.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.25em]">
              {legend.map((item) => {
                const isActive = selectedCategories.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`border px-3 py-1 transition ${
                      isActive
                        ? 'border-brand-highlight bg-brand-highlight text-brand-midnight'
                        : 'border-brand-line text-brand-highlight hover:border-brand-highlight hover:text-brand-amber'
                    }`}
                    onClick={() => handleToggleCategory(item.key)}
                    aria-pressed={isActive}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {averageEntries.length > 0 ? (
              <ul className="mt-5 divide-y divide-brand-line border border-brand-line bg-brand-midnight/30">
                {averageEntries.map((entry) => (
                  <li
                    key={entry.key}
                    className="flex items-center justify-between gap-3 px-3 py-3 text-[12px] text-brand-highlight sm:px-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 border border-brand-line"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div>
                        <p className="font-semibold">{entry.label}</p>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-neutral">
                          Avg per month
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-brand-highlight">
                      {formatAmount(-entry.average)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[11px] text-brand-highlight">
                Select at least one category to see monthly averages.
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-[11px] text-brand-highlight">
            Track spending to unlock monthly category averages.
          </p>
        )}
      </div>
    </div>
  );
};
