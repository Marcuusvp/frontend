# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal finance management app ("Finanças") for tracking credit card invoices, subscriptions, purchases, and bank balance. All UI text is in Brazilian Portuguese (pt-BR). Built with React 19 + Vite 8, backend is Supabase only (auth + database).

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build locally
npm test          # Vitest in watch mode
npm run test:run  # Vitest single run (CI)
```

## Environment Variables

Requires `.env` with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## Architecture

### Routing (src/App.jsx)

All page components are lazy-loaded via `React.lazy()` with named export extraction. Protected routes are wrapped in `PrivateRoute` -> `Layout` -> `Suspense`. Auth pages bypass `Layout`.

Routes: `/login`, `/signup`, `/forgot-password` (public); `/dashboard`, `/cards`, `/cards/:cardId/invoice`, `/subscriptions`, `/balance`, `/profile` (auth-required).

### State Management

No external state library. Auth state flows through `AuthContext` / `AuthProvider` consumed via `useAuth()`. All data fetching lives in custom hooks (`src/hooks/`) that call Supabase directly — each manages its own data/loading/error state with optimistic local updates after mutations.

### Data Layer

No service/API layer. Hooks query Supabase tables directly via the client in `src/lib/supabase.js`:
- `cards` → useCards, useDashboard
- `purchases` → usePurchases, useDashboard
- `subscriptions` → useSubscriptions, useDashboard
- `balance_transactions` → useBalanceTransactions, useDashboard, useInvoicePayments
- `invoice_payments` → useInvoicePayments, useDashboard

### Key Business Logic (src/utils/)

- **date.js**: Safe date parsing from Supabase — `parseSupabaseDate()` appends `T00:00:00` to prevent UTC offset day-shift. All other utils and pages should use these helpers instead of raw `new Date(dateStr)`.
- **installments.js**: Installment engine — each installment's billing month depends on the card's `closing_day`. Purchases after closing day shift to next month. Last installment absorbs rounding.
- **subscriptions.js**: Filters active subscriptions by start/end date against a target month.
- **balance.js**: Transaction aggregation (income/expense/balance totals).
- **errors.js**: Maps Supabase error codes to friendly Portuguese messages.

### Invoice Payment Flow (useInvoicePayments)

`fetchPayment` uses a `requestIdRef` counter to discard stale responses when the user navigates months rapidly.

Marking an invoice paid creates both a `balance_transactions` expense AND an `invoice_payments` record. Unmarking deletes both. Adding a purchase to a paid invoice auto-reopens it if before the closing day.

### Component Patterns

- Forms are modal overlays using `modal-overlay` / `modal-content` CSS classes.
- `getInitialFormData()` factories generate form state from an optional existing entity.
- Pages follow: loading -> error -> empty state -> data list pattern.
- `DeleteConfirmModal` and `MonthNavigator` are shared across pages.
- `useMonthNavigation` hook manages month/year state for Invoice and Balance pages.
- All page and hook modules use named exports (not default exports).

### Styling

Plain CSS files in `src/styles/` imported per-page. CSS variables in `src/index.css` for theming with `prefers-color-scheme` dark mode support. No Tailwind, CSS modules, or CSS-in-JS.

## Deployment

Configured for Vercel with SPA rewrite rule in `vercel.json`.
