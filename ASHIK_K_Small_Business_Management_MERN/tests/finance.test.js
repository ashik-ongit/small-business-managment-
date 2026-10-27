import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedData } from '../src/data/seed.js';
import { PERIODS, totals, paymentTotals, weeklySales, monthlySummary, parseAmount, recentSales, netLabel, validDate } from '../src/domain/finance.js';
import { addTransaction, loadLedger, saveLedger, validLedger, STORAGE_KEY } from '../src/services/ledgerService.js';

const september = PERIODS[2];
test('Opening ledger matches every PPT financial total', () => {
  const data = createSeedData();
  assert.deepEqual(totals(data, september), { sales:14250000, expenses:5824000, net:8426000 });
  assert.deepEqual(paymentTotals(data, september).map(p => p.amount), [4275000, 7125000, 2850000]);
  assert.deepEqual(weeklySales(data, september).map(w => w.amount), [2850000,3420000,3780000,4200000]);
  assert.deepEqual(monthlySummary(data, september).map(m => [m.sales,m.expenses,m.net]), [[11800000,5230000,6570000],[13120000,5620000,7500000],[14250000,5824000,8426000]]);
  assert.deepEqual(recentSales(data, september).map(r => r.amountPaise), [245000,180000,320000,95000]);
});
test('Sale and expense mutations update the shared totals and retain exact paise', () => {
  let data = createSeedData();
  data = addTransaction(data, 'sales', {amount:'100.10',paymentMethod:'UPI',date:'2026-09-28',description:'Test'}, 'new-sale','2026-09-28T17:00:00Z');
  data = addTransaction(data, 'expenses', {amount:'40.20',category:'Stock',date:'2026-09-28',description:'Test'}, 'new-expense');
  assert.equal(totals(data, september).net, 8431990);
  assert.equal(paymentTotals(data, september)[1].amount, 7135010);
  assert.equal(weeklySales(data, september)[3].amount, 4210010);
  assert.equal(recentSales(data, september)[0].id, 'new-sale');
});
test('Period filters exclude other months, including boundary dates', () => {
  let data = createSeedData();
  data = addTransaction(data,'sales',{amount:'1',paymentMethod:'Cash',date:'2026-08-31',description:''},'aug-boundary');
  assert.equal(totals(data, september).sales,14250000);
  assert.equal(totals(data, PERIODS[1]).sales,13120100);
});
test('Loss and break-even are calculated from actual records', () => {
  const data=createSeedData();
  const equal=addTransaction(data,'expenses',{amount:'84260',category:'Rent',date:'2026-09-28',description:''},'equal');
  assert.equal(netLabel(totals(equal,september).net),'Break-even');
  const loss=addTransaction(equal,'expenses',{amount:'0.01',category:'Rent',date:'2026-09-28',description:''},'loss');
  assert.equal(totals(loss,september).net,-1);
  assert.equal(netLabel(-1),'Loss');
});
test('Reject invalid amounts and impossible dates', () => {
  assert.equal(parseAmount('0.10'),10);
  for(const amount of ['0','-1','NaN','1.001','1e5','Infinity','1000000000','']) assert.throws(()=>parseAmount(amount));
  assert.equal(validDate('2026-02-30'),false);
  assert.equal(validDate('2026-09-28'),true);
  assert.throws(()=>addTransaction(createSeedData(),'sales',{amount:'10',paymentMethod:'Bank',date:'2026-09-28',description:''},'invalid'));
});
test('Storage round trip, corrupt data and unavailable storage', () => {
  const values = new Map();
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const data=addTransaction(createSeedData(),'sales',{amount:'80',paymentMethod:'Cash',date:'2026-09-28',description:'Saved'},'saved');
  assert.equal(validLedger(data),true);
  assert.equal(saveLedger(storage,data),'');
  assert.deepEqual(loadLedger(storage).data,data);
  storage.setItem(STORAGE_KEY,'{bad json');
  assert.equal(loadLedger(storage).data.sales.length,createSeedData().sales.length);
  assert.ok(loadLedger(storage).warning);
  assert.ok(saveLedger(undefined,data));
  assert.ok(loadLedger(undefined).warning);
  const damaged=createSeedData();damaged.sales[0].amountPaise=-1;
  assert.equal(validLedger(damaged),false);
});
