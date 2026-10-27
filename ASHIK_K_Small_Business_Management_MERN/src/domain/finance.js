export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card'];
export const EXPENSE_CATEGORIES = ['Stock', 'Rent', 'Electricity', 'Staff Salary'];
export const PERIODS = [
  { id: '2026-07', from: '2026-07-01', to: '2026-07-31', label: '01–31 Jul 2026', month: 'Jul 2026' },
  { id: '2026-08', from: '2026-08-01', to: '2026-08-31', label: '01–31 Aug 2026', month: 'Aug 2026' },
  { id: '2026-09', from: '2026-09-01', to: '2026-09-28', label: '01–28 Sep 2026', month: 'Sep 2026', partial: true },
  { id: '2026-10', from: '2026-10-01', to: '2026-10-31', label: '01–31 Oct 2026', month: 'Oct 2026' },
  { id: '2026-11', from: '2026-11-01', to: '2026-11-30', label: '01–30 Nov 2026', month: 'Nov 2026' },
  { id: '2026-12', from: '2026-12-01', to: '2026-12-31', label: '01–31 Dec 2026', month: 'Dec 2026' },
];
export const DEFAULT_PERIOD = '2026-10';
export const MAX_AMOUNT_PAISE = 99999999999;

// Parse decimal text exactly. Keep all calculations in whole paise.
export function parseAmount(value) {
  const text = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error('Enter a positive amount with up to two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(paise) || paise <= 0 || paise > MAX_AMOUNT_PAISE) {
    throw new Error('Enter an amount between ₹0.01 and ₹99,99,99,999.99.');
  }
  return paise;
}

export function money(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2, maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}

export function dateLabel(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${date.slice(8)} ${months[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;
}

export function inPeriod(records, period) {
  return records.filter(record => record.date >= period.from && record.date <= period.to);
}

export function totals(data, period) {
  const sales = inPeriod(data.sales, period).reduce((sum, row) => sum + row.amountPaise, 0);
  const expenses = inPeriod(data.expenses, period).reduce((sum, row) => sum + row.amountPaise, 0);
  return { sales, expenses, net: sales - expenses };
}

export function paymentTotals(data, period) {
  const rows = inPeriod(data.sales, period);
  return PAYMENT_METHODS.map(method => ({ method, amount: rows.filter(row => row.paymentMethod === method).reduce((sum, row) => sum + row.amountPaise, 0) }));
}

export function weeklySales(data, period) {
  const end = Number(period.to.slice(8));
  const rows = inPeriod(data.sales, period);
  const monthName = period.month.slice(0, 3);
  const result = [];
  for (let start = 1; start <= end; start += 7) {
    const finish = Math.min(start + 6, end);
    result.push({
      label: `${String(start).padStart(2, '0')}–${String(finish).padStart(2, '0')} ${monthName}`,
      amount: rows.filter(row => { const day = Number(row.date.slice(8)); return day >= start && day <= finish; })
        .reduce((sum, row) => sum + row.amountPaise, 0),
    });
  }
  return result;
}

export function monthlySummary(data, period) {
  return PERIODS.filter(month => month.id <= period.id).map(month => ({ ...month, ...totals(data, month) }));
}

export function recentSales(data, period, limit = 4) {
  return inPeriod(data.sales, period).toSorted((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function netLabel(net) {
  return net > 0 ? 'Profit' : net < 0 ? 'Loss' : 'Break-even';
}

export function validateTransaction(kind, input) {
  if (!['sales', 'expenses'].includes(kind)) throw new Error('Unknown transaction type.');
  if (!validDate(input.date)) throw new Error('Choose a valid date.');
  const options = kind === 'sales' ? PAYMENT_METHODS : EXPENSE_CATEGORIES;
  const field = kind === 'sales' ? 'paymentMethod' : 'category';
  if (!options.includes(input[field])) throw new Error('Choose one of the available options.');
  if (typeof input.description !== 'string' || input.description.length > 200) throw new Error('Keep the description under 200 characters.');
  return {
    amountPaise: parseAmount(input.amount), date: input.date, [field]: input[field],
    description: input.description.trim() || (kind === 'sales' ? 'Counter sale' : input.category),
  };
}
