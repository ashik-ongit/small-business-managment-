import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, validateRow, summarize } from '../src/logic.js';
test('exact money parsing',()=>{assert.equal(parseAmount('12.35'),1235);assert.equal(parseAmount('1'),100);assert.throws(()=>parseAmount('3.999'));});
test('record validation',()=>{assert.equal(validateRow('sales',{amount:'500.05',date:'2026-10-10',paymentMethod:'UPI',description:''}).amountPaise,50005);assert.throws(()=>validateRow('expenses',{amount:'1',date:'2026-02-30',category:'Rent',description:''}));});
test('summary balances and category aggregation',()=>{const s=summarize([{kind:'sales',amountPaise:50000,paymentMethod:'UPI'},{kind:'expenses',amountPaise:12500,category:'Rent'}]);assert.equal(s.netProfitLossPaise,37500);assert.equal(s.paymentMethods.UPI,50000);});
