import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Four React screens render, accept entries, update totals and persist after remount', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost:5173/#/dashboard' });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    MutationObserver: dom.window.MutationObserver,
    Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
  const vite = await createServer({ root, server: { middlewareMode:true }, appType:'custom', logLevel:'silent' });
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
  const { render, fireEvent, screen, cleanup } = await import('@testing-library/react');
  const { act } = await import('react');
  async function navigate(name) {
    await act(async () => {
      dom.window.location.hash = `#/${name.toLowerCase()}`;
      dom.window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'));
    });
  }
  dom.window.scrollTo = () => {};
  try {
    const first = render(React.createElement(App), { container: document.getElementById('root') });
    assert.equal(screen.getByTestId('total-sales').textContent, '₹1,42,500');
    for (const name of ['Sales', 'Expenses', 'Reports', 'Dashboard']) {
      await navigate(name);
      assert.ok(screen.getByRole('heading', { name, exact:true }));
    }
    await navigate('Sales');
    fireEvent.change(screen.getByLabelText('Amount (₹)'), {target:{value:'1000'}});
    fireEvent.change(screen.getByLabelText('Description'), {target:{value:'Demo sale'}});
    await act(async () => { fireEvent.submit(screen.getByRole('button', {name:'Add Sale'}).closest('form')); });
    assert.ok(screen.getByText('Demo sale'));
    await navigate('Dashboard');
    assert.equal(screen.getByTestId('total-sales').textContent, '₹1,43,500');
    assert.equal(screen.getByTestId('net-total').textContent, '₹85,260');
    first.unmount();
    const nextRoot = document.createElement('div');
    document.body.appendChild(nextRoot);
    render(React.createElement(App), { container: nextRoot });
    assert.equal(screen.getByTestId('net-total').textContent, '₹85,260');
    assert.ok(dom.window.localStorage.getItem('sbms-review-demo-v1'));
  } finally {
    cleanup(); await vite.close(); dom.window.close();
  }
});
