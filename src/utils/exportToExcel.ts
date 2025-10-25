import { format } from 'date-fns';
import { utils, writeFile } from 'xlsx';
import { CATEGORY_META, type Expense } from '../types';

interface ExportToExcelOptions {
  currencyLabel?: string;
  currencyCode?: string;
}

const formatDateSafe = (value: string | null | undefined) => {
  if (value == null) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd HH:mm');
};

export const exportExpensesToExcel = (
  expenses: Expense[],
  { currencyLabel, currencyCode }: ExportToExcelOptions = {}
) => {
  const rows = expenses.map((expense) => {
    const meta = CATEGORY_META[expense.category];
    const isIncome = meta.type === 'income';
    return {
      Date: formatDateSafe(expense.date),
      Category: meta.label,
      Type: isIncome ? 'Income' : 'Expense',
      Amount: isIncome ? expense.amount : -expense.amount,
      Currency: currencyLabel ?? currencyCode ?? '',
      Note: expense.note,
      'Created At': formatDateSafe(expense.createdAt),
      'Updated At': formatDateSafe(expense.updatedAt),
      'Entry ID': expense.id
    };
  });

  const worksheet = utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 40 },
    { wch: 20 },
    { wch: 20 },
    { wch: 30 }
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Activity');

  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  const filename = `money-map-activity-${timestamp}.xlsx`;

  writeFile(workbook, filename, { compression: true });
};

