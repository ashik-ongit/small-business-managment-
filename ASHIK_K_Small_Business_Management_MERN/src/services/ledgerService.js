import { createSeedData } from '../data/seed.js';
import { PAYMENT_METHODS, EXPENSE_CATEGORIES, MAX_AMOUNT_PAISE, validDate, validateTransaction } from '../domain/finance.js';

export const STORAGE_KEY = 'sbms-review-demo-v1';

export function validLedger(value) {
  if (value?.version !== 1 || !Array.isArray(value.sales) || !Array.isArray(value.expenses)) return false;
  const ids = new Set();
  return ['sales', 'expenses'].every(kind => value[kind].every(row => {
    if (!row || typeof row.id !== 'string' || ids.has(row.id)) return false;
    ids.add(row.id);
    return Number.isSafeInteger(row.amountPaise) && row.amountPaise > 0 && row.amountPaise <= MAX_AMOUNT_PAISE
      && validDate(row.date) && typeof row.createdAt === 'string' && Number.isFinite(Date.parse(row.createdAt))
      && typeof row.description === 'string' && row.description.length <= 200
      && (kind === 'sales' ? PAYMENT_METHODS.includes(row.paymentMethod) : EXPENSE_CATEGORIES.includes(row.category));
  }));
}

// Storage is behind this boundary so an Axios/Express adapter can replace it later.
// No database, account, payment API, or network call is needed for this demo.
export function loadLedger(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { data: createSeedData(), warning: '' };
    const parsed = JSON.parse(raw);
    if (!validLedger(parsed)) throw new Error('Invalid saved ledger');
    return { data: parsed, warning: '' };
  } catch {
    return { data: createSeedData(), warning: 'Saved demo data could not be loaded. Sample data is shown.' };
  }
}

export function saveLedger(storage, data) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return '';
  } catch {
    return 'Saved for this session only. Browser storage is unavailable.';
  }
}

export function addTransaction(data, kind, input, id = crypto.randomUUID(), now = new Date().toISOString()) {
  const transaction = { ...validateTransaction(kind, input), id, createdAt: now };
  const next = { ...data, [kind]: [transaction, ...data[kind]] };
  // Keep integer aggregates exact even after an unusually large amount of input.
  for (const list of [next.sales, next.expenses]) {
    if (!Number.isSafeInteger(list.reduce((sum, row) => sum + row.amountPaise, 0))) throw new Error('The demo ledger has reached its amount limit.');
  }
  return next;
}
