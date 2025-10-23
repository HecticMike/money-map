import { useMemo } from 'react';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  LinearScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Doughnut, Line } from 'react-chartjs-2';
import { CATEGORY_META, type ExpenseStats } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Filler);
ChartJS.defaults.color = '#facc15';
ChartJS.defaults.font = {
  family: '"Space Grotesk", sans-serif',
  size: 11
};

interface SpendingChartsProps {
  stats: ExpenseStats;
  formatAmount: (value: number) => string;
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({ stats, formatAmount }) => {
  const { chartData, legend } = useMemo(() => {
    const entries = Object.entries(stats.byCategory)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => {
        const meta = CATEGORY_META[key as keyof typeof CATEGORY_META];
        return {
          label: meta.label,
          color: meta.color,
          value: Number(value.toFixed(2))
        };
      });

    const total = entries.reduce((sum, item) => sum + item.value, 0);
    const sorted = entries
      .map((item) => ({
        ...item,
        percent: total === 0 ? 0 : Math.round((item.value / total) * 100)
      }))
      .filter((item) => item.percent > 0)
      .sort((a, b) => b.percent - a.percent);

    return {
      chartData: {
        labels: sorted.map((item) => item.label),
        datasets: [
          {
            label: 'Income vs outgoings',
            data: sorted.map((item) => item.value),
            backgroundColor: sorted.map((item) => item.color),
            borderWidth: 1,
            borderColor: '#1f2647'
          }
        ]
      },
      legend: sorted
    };
  }, [stats.byCategory]);

  const categoryChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: '#fef3c7',
            font: {
              family: '"Space Grotesk", sans-serif',
              size: 10
            }
          }
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

  const trendChartData = useMemo(() => {
    return {
      labels: stats.monthlyTotals.map((item) => new Date(item.month)),
      datasets: [
        {
          label: 'Monthly spend',
          data: stats.monthlyTotals.map((item) => item.total),
          borderColor: '#facc15',
          backgroundColor: 'rgba(250, 204, 21, 0.15)',
          pointBackgroundColor: '#facc15',
          fill: true,
          tension: 0.35
        }
      ]
    };
  }, [stats.monthlyTotals]);

  const trendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) =>
              formatAmount(typeof context.parsed.y === 'number' ? context.parsed.y : 0)
          },
          backgroundColor: '#1f2647',
          borderColor: '#facc15',
          borderWidth: 1,
          titleColor: '#facc15',
          bodyColor: '#fef3c7'
        }
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: 'month' as const
          },
          grid: {
            display: false
          },
          ticks: {
            color: '#fef3c7',
            font: {
              family: '"Space Grotesk", sans-serif',
              size: 10
            }
          }
        },
        y: {
          ticks: {
            callback: (value: number | string) =>
              typeof value === 'number' ? formatAmount(value) : value,
            color: '#fef3c7',
            font: {
              family: '"Space Grotesk", sans-serif',
              size: 10
            }
          },
          grid: {
            color: '#2f355a'
          }
        }
      }
    }),
    [formatAmount]
  );

  return (
    <div className="grid gap-4">
      <div className="border border-brand-line bg-brand-ocean/80 px-3 py-4 sm:px-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-amber sm:text-sm">
          Income vs outgoings
        </h3>
        {legend.length > 0 ? (
          <>
            <div className="mt-4 flex justify-center">
            <div className="h-48 w-48">
                <Doughnut data={chartData} options={categoryChartOptions} />
            </div>
          </div>
            <ul className="mt-4 grid gap-2 text-[11px] text-brand-highlight">
              {legend.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 border border-brand-line"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1">
                    {item.label}
                  </span>
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
          Monthly trend
        </h3>
        {trendChartData.labels.length > 1 ? (
          <div className="mt-6 h-72">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        ) : (
          <p className="mt-4 text-[11px] text-brand-highlight">
            Add entries across different months to see your trend.
          </p>
        )}
      </div>
    </div>
  );
};





