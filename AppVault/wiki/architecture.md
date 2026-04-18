# Architecture

**Summary**: Arquitetura do app Finanças — routing, state management, data layer e organização de código.

**Sources**: ProjectOverview.md

**Last updated**: 2026-04-17

---

## Routing (src/App.jsx)

- Páginas lazy-loaded via `React.lazy()` com extração de named exports
- Rotas públicas (auth) bypassam o `Layout`
- Rotas protegidas: `PrivateRoute` -> `Layout` -> `Suspense`

```
/login, /signup, /forgot-password  → Auth pages (sem Layout)
/dashboard                          → Dashboard
/cards                              → Lista de cartões
/cards/:cardId/invoice              → Fatura de um cartão
/subscriptions                      → Mensalidades
/balance                            → Extrato
/profile                            → Perfil do usuário
```

## State Management

Sem biblioteca externa. Dois mecanismos:

- **Auth**: `AuthContext` / `AuthProvider` consumido via `useAuth()` (ver [[data-model]])
- **Data fetching**: Hooks customizados em `src/hooks/` que chamam Supabase diretamente

Cada hook gerencia seu próprio estado de data/loading/error com updates otimistas locais após mutations.

## Data Layer

Sem camada de service/API. Hooks query Supabase diretamente via client em `src/lib/supabase.js`.

Tabelas (ver [[data-model]]):
- `cards` → useCards, useDashboard
- `purchases` → usePurchases, useDashboard
- `subscriptions` → useSubscriptions, useDashboard
- `balance_transactions` → useBalanceTransactions, useDashboard, useInvoicePayments
- `invoice_payments` → useInvoicePayments, useDashboard

## Diretórios

```
src/
  pages/          → Componentes de página (named exports)
  components/     → Componentes compartilhados (forms, modais, etc)
  hooks/          → Hooks de data fetching
  utils/          → Lógica de negócio (ver [[business-logic]])
  lib/            → Client Supabase
  styles/         → CSS por página + shared (ver [[styling]])
```

## Related pages

- [[project-overview]]
- [[data-model]]
- [[business-logic]]
- [[component-patterns]]
