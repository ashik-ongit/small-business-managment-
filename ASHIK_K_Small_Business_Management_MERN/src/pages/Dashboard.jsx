import React from 'react';
import { useLedger } from '../context/LedgerContext.jsx';
import { totals, weeklySales, paymentTotals, recentSales } from '../domain/finance.js';
import SummaryCards from '../components/SummaryCards.jsx';
import { SalesTrend, PaymentBreakdown } from '../components/Charts.jsx';
import TransactionTable from '../components/TransactionTable.jsx';

export default function Dashboard() {
  const { data, period } = useLedger();
  return <><SummaryCards summary={totals(data, period)} /><div className="columns"><SalesTrend weeks={weeklySales(data, period)} /><PaymentBreakdown payments={paymentTotals(data, period)} /></div><section className="card"><h2>Recent transactions</h2><TransactionTable rows={recentSales(data, period, 2)} recent /><div className="note">Latest sales shown. Full records are available under Sales and Expenses.</div></section></>;
}
