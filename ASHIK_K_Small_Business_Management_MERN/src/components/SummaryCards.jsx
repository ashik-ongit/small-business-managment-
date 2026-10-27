import React from 'react';
import { money, netLabel } from '../domain/finance.js';

export default function SummaryCards({ summary }) {
  const label = netLabel(summary.net);
  return <div className="metrics">
    <div className="card metric"><div className="label">TOTAL SALES</div><div className="value" data-testid="total-sales">{money(summary.sales)}</div><div className="small">Cash + UPI + Card</div></div>
    <div className="card metric"><div className="label">TOTAL EXPENSES</div><div className="value" data-testid="total-expenses">{money(summary.expenses)}</div><div className="small">Recorded business expenses</div></div>
    <div className={`card metric ${summary.net < 0 ? 'loss' : 'profit'}`}><div className="label">{summary.net === 0 ? 'BREAK-EVEN' : `NET ${label.toUpperCase()}`}</div><div className="value" data-testid="net-total">{money(summary.net)}</div><div className={`small ${summary.net < 0 ? 'negative' : 'good'}`}>{label} for the selected period</div></div>
  </div>;
}
