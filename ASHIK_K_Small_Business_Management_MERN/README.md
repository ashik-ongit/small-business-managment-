# Small Business Management System — ASHIK K (310624149008)

Full Stack Development final-review project. React + Vite frontend, Express + Node.js backend, MongoDB + Mongoose. This project extends the uploaded black-and-cream UI prototype and replaces localStorage with real database persistence.

## Features

- Business-owner registration and login (hashed passwords, JWT sessions)
- Separate business data per account; API scopes every transaction to the logged-in business
- Sales tracking with Cash / UPI / Card
- Expense tracking by Stock / Rent / Electricity / Staff Salary
- Create, view, edit and delete financial records
- Dashboard: sales, expenses, net profit/loss, payment mix and weekly trend
- Monthly report summaries and INR/paise calculations
- Responsive screens, validation, basic API security middleware
- Optional demo account with populated transactions via seed command

## Requirements

- Node.js **22.12+** and npm (Vite 8 frontend; tested against the provided React prototype)
- MongoDB Community Server running locally, or a free MongoDB Atlas cluster
- Windows PowerShell / macOS / Linux terminal

## Step-by-step installation

1. Extract the ZIP. Open a terminal inside `ASHIK_K_Small_Business_Management_MERN`.
2. Run `npm install`.
3. Run `npm --prefix backend install`.
4. Copy `backend/.env.example` to `backend/.env`.
5. Make sure `MONGODB_URI` points to your own working MongoDB database, e.g. `mongodb://127.0.0.1:27017/ashik_small_business`.
6. Set `JWT_SECRET` in `backend/.env` to a long random string **at least 32 characters**. Do not share or commit the `.env` file.
7. Optional but recommended for final-review demo: run `npm run seed` once.
8. Run `npm run dev:all` to start both frontend and backend.
9. Open **http://localhost:5173** in your browser.

For manual launch use two terminals: `npm run backend:dev` in one and `npm run dev` in the other.

**Demo account** (only after running seed): `ashik.demo@example.com` / `Demo@12345`. Change or remove this demo account for any non-college deployment.

Create a normal owner/business account via the Register link if you want to start with empty records. Transactions are private to each registered business.

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | /api/health | Health check |
| POST | /api/auth/register | Create business and owner |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Session identity |
| GET | /api/ledger | All records for current business |
| GET | /api/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD | Aggregated totals |
| GET | /api/sales | List sales |
| POST | /api/sales | Record sale |
| PUT | /api/sales/:id | Edit sale |
| DELETE | /api/sales/:id | Delete sale |
| GET | /api/expenses | List expenses |
| POST | /api/expenses | Record expense |
| PUT | /api/expenses/:id | Edit expense |
| DELETE | /api/expenses/:id | Delete expense |

Protected routes require `Authorization: Bearer <token>`. Create/update expects an amount such as `1200.50`, an ISO date, description, and payment method or expense category.

## Testing and build

- `npm run test:backend` — backend domain-rule unit tests
- `npm test` — frontend financial logic tests; legacy UI test was written for browser-localStorage and is not an integration test for the new authenticated API
- `npm run build` — Vite frontend production compilation

> The old screenshot tests were designed for the localStorage-only prototype and should not be used to claim an authenticated backend integration test. For final review, test registration/login, creating sales and expenses, dashboard recalculation, editing/deleting records, logout/relogin persistence, and business isolation using a running MongoDB instance.

## Local walkthrough for the examiner

1. Login with demo user.
2. Visit Dashboard and explain Cash / UPI / Card totals and profit/loss formula.
3. Add a Cash sale on the Sales page for October 2026.
4. Add a Stock expense on the Expenses page.
5. Confirm reports show the updated totals.
6. Edit or delete a record and verify that figures change.
7. Logout and login again: data remains in MongoDB.
8. Create a separate new account and show that its records are separate.

## GitHub

After verifying locally:

```bash
git init
git add .
git commit -m "Full MERN small business management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Create the empty GitHub repository before adding remote. **Never push `backend/.env` or your database password**.

## Scope

This is a college final-review project. It records and reports business transactions; it does not move money, process a payment gateway, perform GST filing, or act as certified accounting software. Production security review is outside its demonstration scope.
