# Project Overview

**Summary**: App de gestão financeira pessoal ("Finanças") para rastrear faturas de cartão, assinaturas, compras e saldo bancário. Interface toda em pt-BR, built with React 19 + Vite 8 + Supabase.

**Sources**: ProjectOverview.md

**Last updated**: 2026-04-17

---

## Stack

- **Frontend**: React 19, Vite 8
- **Backend**: Supabase (auth + database)
- **Styling**: CSS puro com design tokens (ver [[styling]])
- **Deploy**: Vercel com SPA rewrite
- **No**: test framework, state library, service layer, Tailwind

## Comandos

```bash
npm run dev       # Dev server (Vite)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview build local
```

## Env vars

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## Rotas

**Públicas**: `/login`, `/signup`, `/forgot-password`
**Autenticadas**: `/dashboard`, `/cards`, `/cards/:cardId/invoice`, `/subscriptions`, `/balance`, `/profile`

Todas as páginas são lazy-loaded via `React.lazy()` com named exports. Rotas protegidas envolvidas em `PrivateRoute` -> `Layout` -> `Suspense`.

## Related pages

- [[architecture]]
- [[data-model]]
- [[business-logic]]
- [[component-patterns]]
- [[styling]]
