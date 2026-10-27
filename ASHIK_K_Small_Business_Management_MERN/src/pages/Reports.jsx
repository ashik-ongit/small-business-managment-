import React from 'react';
import { useLedger } from '../context/LedgerContext.jsx';
import { totals, monthlySummary, money, netLabel } from '../domain/finance.js';
import SummaryCards from '../components/SummaryCards.jsx';
import { MonthlyChart } from '../components/Charts.jsx';

export default function Reports() {
  const { data, period } = useLedger();
  const summary = totals(data, period), months = monthlySummary(data, period), label = netLabel(summary.net);
  const monthName = period.month;
  return <><SummaryCards summary={summary} /><div className="columns"><MonthlyChart months={months} /><section className={`card ${summary.net < 0 ? 'loss' : 'profit'}`}><h2>{label} for {monthName}{period.partial ? '*' : ''}</h2><div className="value">{money(summary.net)}</div><p className={summary.net < 0 ? 'negative' : 'good'}>Total sales − Total expenses</p><div className="note">{money(summary.sales)} − {money(summary.expenses)}</div><div className="note">{summary.net > 0 ? 'Positive balance' : summary.net < 0 ? 'Negative balance' : 'Balanced sales and expenses'} across recorded transactions.</div></section></div><section className="card"><h2>Period summary</h2><div className="table-scroll"><table><thead><tr>{['Month', 'Total sales', 'Total expenses', 'Net profit/loss'].map(heading => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>{months.map(month => <tr key={month.id}><td>{month.month}{month.partial ? '*' : ''}</td><td>{money(month.sales)}</td><td>{money(month.expenses)}</td><td className={month.net < 0 ? 'negative' : ''}>{money(month.net)}</td></tr>)}</tbody></table></div></section><p className="note">{period.partial ? '*September includes 01–28 Sep. ' : ''}Figures are calculated from your saved business records.</p></>;
}
