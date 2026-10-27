import React from 'react';
import { money } from '../domain/finance.js';

export function SalesTrend({ weeks }) {
  const max = Math.max(1, ...weeks.map(week => week.amount));
  return <div className="card"><h2>Sales trend <span className="small">/ weekly totals</span></h2>
    <div className="chart" role="img" aria-label={`Weekly sales: ${weeks.map(w => `${w.label}, ${money(w.amount)}`).join('; ')}`}>
      {weeks.map(week => <div key={week.label} className="bar" style={{ height: `${week.amount / max * 100}%` }} title={`${week.label}: ${money(week.amount)}`} />)}
    </div><div className="labels">{weeks.map(week => <span key={week.label}>{week.label}</span>)}</div>
  </div>;
}

export function PaymentBreakdown({ payments }) {
  const max = Math.max(1, ...payments.map(payment => payment.amount));
  return <div className="card"><h2>Payment methods</h2>{payments.map(({ method, amount }) => <div className="payment" key={method}><span>{method}</span><div className="track"><div className="fill" style={{ width: `${amount / max * 100}%` }} /></div><span className="amount">{money(amount)}</span></div>)}</div>;
}

export function MonthlyChart({ months }) {
  const max = Math.max(1, ...months.flatMap(month => [month.sales, month.expenses]));
  return <div className="card"><div className="line"><h2>Monthly overview</h2><div className="legend"><span><i className="dot" />Sales</span><span><i className="dot expensebar" />Expenses</span></div></div>
    <div className="chart" role="img" aria-label={`Monthly comparison: ${months.map(m => `${m.month}, sales ${money(m.sales)}, expenses ${money(m.expenses)}`).join('; ')}`}>
      {months.map(month => <div className="pair" key={month.id}><div className="bar" style={{ height: `${month.sales / max * 100}%` }} title={`Sales: ${money(month.sales)}`} /><div className="bar expensebar" style={{ height: `${month.expenses / max * 100}%` }} title={`Expenses: ${money(month.expenses)}`} /></div>)}
    </div><div className="labels">{months.map(month => <span key={month.id}>{month.month}{month.partial ? '*' : ''}</span>)}</div>
  </div>;
}
