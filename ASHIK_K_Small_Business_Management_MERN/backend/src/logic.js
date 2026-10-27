export const PAYMENT_METHODS = ['Cash','UPI','Card'];
export const EXPENSE_CATEGORIES = ['Stock','Rent','Electricity','Staff Salary'];
export function parseAmount(value) {
  const str = String(value ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(str)) throw new Error('Amount must be a positive number with up to 2 decimals.');
  const [rupees, fractions = ''] = str.split('.');
  const n = Number(rupees) * 100 + Number(fractions.padEnd(2,'0'));
  if (!Number.isSafeInteger(n) || n < 1 || n > 99999999999) throw new Error('Amount out of range.');
  return n;
}
export function validDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s; }
export function validateRow(kind, raw) {
  if (!['sales','expenses'].includes(kind)) throw new Error('Invalid transaction type.');
  const amountPaise = raw.amountPaise !== undefined ? raw.amountPaise : parseAmount(raw.amount);
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 1 || amountPaise > 99999999999) throw new Error('Invalid amount.');
  if (!validDate(raw.date)) throw new Error('Invalid calendar date.');
  if (typeof raw.description !== 'string' || raw.description.length > 200) throw new Error('Description must be at most 200 characters.');
  const details = kind === 'sales'
    ? {paymentMethod: raw.paymentMethod} : {category: raw.category};
  if (kind === 'sales' && !PAYMENT_METHODS.includes(raw.paymentMethod)) throw new Error('Invalid payment method.');
  if (kind === 'expenses' && !EXPENSE_CATEGORIES.includes(raw.category)) throw new Error('Invalid expense category.');
  return {kind, amountPaise, date:raw.date, description:raw.description.trim(), ...details};
}
export function summarize(rows) {
  const result = {totalSalesPaise:0,totalExpensesPaise:0,transactionCount:rows.length,paymentMethods:{Cash:0,UPI:0,Card:0},expenseCategories:{Stock:0,Rent:0,Electricity:0,'Staff Salary':0}};
  for (const row of rows) {
    if (row.kind === 'sales') { result.totalSalesPaise += row.amountPaise;result.paymentMethods[row.paymentMethod] += row.amountPaise; }
    else {result.totalExpensesPaise += row.amountPaise;result.expenseCategories[row.category] += row.amountPaise;}
  }
  result.netProfitLossPaise = result.totalSalesPaise - result.totalExpensesPaise;
  return result;
}
