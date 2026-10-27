import React from 'react';
import { dateLabel, money } from '../domain/finance.js';

export default function TransactionTable({ rows, kind = 'sales', recent = false }) {
  const sales = kind === 'sales';
  const headers = sales ? ['Date', 'Description', recent ? 'Method' : 'Payment method', 'Amount'] : ['Date', 'Category', 'Description', 'Amount'];
  return <div className="table-scroll"><table>
    <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map(row => <tr key={row.id}>
      <td>{dateLabel(row.date)}</td>
      <td className={sales ? 'description' : ''}>{sales ? row.description : row.category}</td>
      <td className={sales ? '' : 'description'}>{sales ? <span className="tag">{row.paymentMethod}</span> : row.description}</td>
      <td>{money(row.amountPaise)}</td>
    </tr>) : <tr><td colSpan={4} className="empty">No {sales ? 'sales' : 'expenses'} recorded for this period.</td></tr>}</tbody>
  </table></div>;
}
