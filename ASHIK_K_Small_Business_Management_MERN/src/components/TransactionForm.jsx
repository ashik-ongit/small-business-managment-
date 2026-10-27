import React, { useState } from 'react';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../domain/finance.js';
import { useLedger } from '../context/LedgerContext.jsx';

export default function TransactionForm({ kind }) {
  const { period, addRecord } = useLedger();
  const isSale = kind === 'sales';
  const options = isSale ? PAYMENT_METHODS : EXPENSE_CATEGORIES;
  const [amount, setAmount] = useState('');
  const [choice, setChoice] = useState(options[0]);
  const [date, setDate] = useState(period.to);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setError(''); setMessage(''); setSaving(true);
    try {
      const warning = await addRecord(kind, { amount, date, description, [isSale ? 'paymentMethod' : 'category']: choice });
      setAmount(''); setDescription('');
      setMessage(`${isSale ? 'Sale' : 'Expense'} added. ${warning || 'Totals updated.'}`);
    } catch (problem) { setError(problem.message); }
    finally { setSaving(false); }
  }
  return <section className="card"><h2>Record {isSale ? 'a sale' : 'an expense'}</h2>
    <form onSubmit={submit}>
      <div className="form">
        <div><label htmlFor={`${kind}-amount`}>Amount (₹)</label><input id={`${kind}-amount`} name="amount" inputMode="decimal" type="number" min="0.01" max="999999999.99" step="0.01" placeholder="0.00" value={amount} onChange={event => { setAmount(event.target.value); setMessage(''); }} required /></div>
        <div><label htmlFor={`${kind}-choice`}>{isSale ? 'Payment method' : 'Category'}</label><select id={`${kind}-choice`} value={choice} onChange={event => setChoice(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></div>
        <div><label htmlFor={`${kind}-date`}>Date</label><input id={`${kind}-date`} name="date" type="date" min={period.from} max={period.to} value={date} onChange={event => setDate(event.target.value)} required /></div>
        <div><label htmlFor={`${kind}-description`}>Description</label><input id={`${kind}-description`} name="description" maxLength={200} placeholder={isSale ? 'e.g. Counter sale' : 'e.g. Monthly shop rent'} value={description} onChange={event => setDescription(event.target.value)} /></div>
      </div>
      <div className="form-foot"><p className={`small ${error ? 'negative' : message ? 'good' : ''}`} role={error ? 'alert' : 'status'}>{error || message || `Each ${isSale ? 'sale adds to total sales.' : 'expense adds to total expenses.'}`}</p><button className="primary" type="submit" disabled={saving}>{isSale ? 'Add Sale' : 'Add Expense'}</button></div>
    </form>
  </section>;
}
