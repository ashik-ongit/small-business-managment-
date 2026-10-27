import React from 'react';
import { useLedger } from '../context/LedgerContext.jsx';
import { inPeriod, totals } from '../domain/finance.js';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';

export default function Expenses() {
  const { data, period } = useLedger();
  return <><TransactionForm kind="expenses" key={period.id} /><TransactionHistory kind="expenses" rows={inPeriod(data.expenses, period)} total={totals(data, period).expenses} /></>;
}
