// Complete mock ledger behind the PPT's totals, charts and recent-record tables.
// Hidden older entries are normal records, not unexplained balance offsets.
function sale(id, amount, paymentMethod, date, description = 'Counter sales', time = '12:00:00') {
  return { id, amountPaise: amount * 100, paymentMethod, date, description, createdAt: `${date}T${time}.000Z` };
}
function expense(id, amount, category, date, description) {
  return { id, amountPaise: amount * 100, category, date, description, createdAt: `${date}T12:00:00.000Z` };
}

export function createSeedData() {
  const sales = [];
  for (const [month, weekly] of [
    ['07', [24000, 28000, 30000, 36000]],
    ['08', [28200, 31000, 34000, 38000]],
    ['09', [28500, 34200, 37800]],
  ]) {
    weekly.forEach((amount, i) => {
      const date = `2026-${month}-${String((i + 1) * 7).padStart(2, '0')}`;
      for (const [method, fraction] of [['Cash', .3], ['UPI', .5], ['Card', .2]]) {
        sales.push(sale(`${month}-${i}-${method}`, Math.round(amount * fraction), method, date, 'Counter sales — weekly summary'));
      }
    });
  }
  sales.push(
    sale('sep-cash-summary', 10800, 'Cash', '2026-09-26', 'Counter sales — weekly summary'),
    sale('sep-upi-summary', 17600, 'UPI', '2026-09-26', 'Counter sales — weekly summary'),
    sale('sep-card-summary', 5200, 'Card', '2026-09-26', 'Counter sales — weekly summary'),
    sale('sep-upi-27', 950, 'UPI', '2026-09-27', 'Counter sale', '10:00:00'),
    sale('sep-card-27', 3200, 'Card', '2026-09-27', 'Customer order', '15:00:00'),
    sale('sep-cash-28', 1800, 'Cash', '2026-09-28', 'Counter sale', '10:00:00'),
    sale('sep-upi-28', 2450, 'UPI', '2026-09-28', 'Counter sale', '15:00:00'),
  );
  const expenses = [
    expense('sep-stock', 26000, 'Stock', '2026-09-26', 'Wholesale purchase'),
    expense('sep-rent', 15000, 'Rent', '2026-09-05', 'September shop rent'),
    expense('sep-electricity', 3240, 'Electricity', '2026-09-08', 'Monthly utility bill'),
    expense('sep-salary', 14000, 'Staff Salary', '2026-09-28', 'September wages'),
  ];
  for (const [month, name, stock, power] of [['07', 'July', 21000, 2300], ['08', 'August', 24200, 3000]]) {
    expenses.push(
      expense(`${month}-stock`, stock, 'Stock', `2026-${month}-26`, 'Wholesale purchase'),
      expense(`${month}-rent`, 15000, 'Rent', `2026-${month}-05`, `${name} shop rent`),
      expense(`${month}-electricity`, power, 'Electricity', `2026-${month}-08`, 'Monthly utility bill'),
      expense(`${month}-salary`, 14000, 'Staff Salary', `2026-${month}-28`, `${name} wages`),
    );
  }
  return { version: 1, sales, expenses };
}
