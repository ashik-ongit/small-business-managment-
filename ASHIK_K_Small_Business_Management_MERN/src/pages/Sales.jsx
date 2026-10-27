import React from 'react';
import { useLedger } from '../context/LedgerContext.jsx';
import { totals, recentSales } from '../domain/finance.js';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';

export default function Sales() {
  const { data, period } = useLedger();
  return <><TransactionForm kind="sales" key={period.id} /><TransactionHistory kind="sales" rows={recentSales(data, period, 2000)} total={totals(data, period).sales} /></>;
}
