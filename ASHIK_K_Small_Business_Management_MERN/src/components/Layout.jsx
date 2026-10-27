import React from 'react';
import { PERIODS } from '../domain/finance.js';
import { useLedger } from '../context/LedgerContext.jsx';
import {useAuth} from '../context/AuthContext.jsx';

export const SCREENS = ['Dashboard', 'Sales', 'Expenses', 'Reports'];
const descriptions = {
  Dashboard: 'A clear view of your business.', Sales: 'Track every payment in one place.',
  Expenses: 'Keep business spending organized.', Reports: 'Understand your sales, spending and profit.',
};

export default function Layout({ screen, children }) {
  const { period, setPeriodId, warning } = useLedger();
  const { user, logout } = useAuth();
  return <>
    <aside>
      <div className="brand">Small<br />Business</div>
      <div className="sub">MANAGEMENT SYSTEM</div>
      <nav aria-label="Main navigation">{SCREENS.map(name => <a key={name} href={`#/${name.toLowerCase()}`} className={`nav ${screen === name ? 'active' : ''}`} aria-current={screen === name ? 'page' : undefined}>{name}</a>)}</nav>
      <div className="aside-bottom">{user?.businessName || 'My Business'}<br /><span>{user?.name || 'Owner'}</span><button className="logout" onClick={logout}>Log out</button></div>
    </aside>
    <main className={screen.toLowerCase()}>
      <div className="top"><span>WORKSPACE / {screen.toUpperCase()}</span><span className="demo">MongoDB connected · MERN</span></div>
      <div className="heading"><div><h1>{screen}</h1><p>{descriptions[screen]}</p></div>
        <div className="period-control"><select aria-label="Reporting period" value={period.id} onChange={event => setPeriodId(event.target.value)}>{[...PERIODS].reverse().map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><span aria-hidden="true">▾</span></div>
      </div>
      {warning && <p className="storage-warning" role="status">{warning}</p>}
      {children}
    </main>
  </>;
}
