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
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  }, [stats.byCategory]);

  const categoryChartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label ?? '';
              const value = typeof context.parsed === 'number' ? context.parsed : 0;
              return `${label}: ${formatAmount(value)}`;
            }
          }
        }
      },
      cutout: '60%'
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
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14,165,233,0.2)',
          pointBackgroundColor: '#0ea5e9',
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
            label: (context: any) => formatAmount(typeof context.parsed.y === 'number' ? context.parsed.y : 0)
          }
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
          }
        },
        y: {
          ticks: {
            callback: (value: number | string) =>
              typeof value === 'number' ? formatAmount(value) : value
          }
        }
      }
    }),
    [formatAmount]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-white/5">
        <h3 className="text-lg font-semibold text-slate-200">Income vs outgoings</h3>
        {categoryChartData.labels.length > 0 ? (
          <div className="mt-6">
            <Doughnut data={categoryChartData} options={categoryChartOptions} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-300">
            Categorise expenses to see where your money flows.
          </p>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-white/5">
        <h3 className="text-lg font-semibold text-slate-200">Monthly trend</h3>
        {trendChartData.labels.length > 1 ? (
          <div className="mt-6 h-72">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-300">
            Add entries across different months to see your trend.
          </p>
        )}
      </div>
    </div>
  );
};




