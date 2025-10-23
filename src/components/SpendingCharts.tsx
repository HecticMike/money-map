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
  const categoryChartData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    Object.entries(stats.byCategory).forEach(([key, value]) => {
      if (value <= 0) return;
      const meta = CATEGORY_META[key as keyof typeof CATEGORY_META];
      labels.push(meta.label);
      data.push(Number(value.toFixed(2)));
      colors.push(meta.color);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Income vs outgoings',
          data,
          backgroundColor: colors,
          borderWidth: 1,
          borderColor: '#1f2647'
        }
      ]
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
        {categoryChartData.labels.length > 0 ? (
          <div className="mt-6 flex justify-center">
            <div className="h-48 w-48">
              <Doughnut data={categoryChartData} options={categoryChartOptions} />
            </div>
          </div>
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





