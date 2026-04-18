# Styling

**Summary**: Sistema de estilização — design tokens em CSS custom properties, padrões compartilhados e CSS por página.

**Sources**: ProjectOverview.md

**Last updated**: 2026-04-17

---

## Abordagem

CSS puro, sem Tailwind, CSS modules ou CSS-in-JS. Arquivos em `src/styles/` importados por página.

## Design Tokens (src/index.css)

Tokens definidos em `:root` como CSS custom properties:

- **Cores**: `--color-primary` (#57449a), `--color-success`, `--color-danger`, `--color-warning`, `--color-info`, + variantes (dark, light, alpha)
- **Tipografia**: `--font-size-xs` (12px) até `--font-size-4xl` (28px)
- **Espaçamento**: `--space-xs` (4px) até `--space-3xl` (32px)
- **Radius**: `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px)
- **Sombras**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- **Transições**: `--transition-fast` (all 0.2s ease)

## Arquivos CSS

| Arquivo | Importado por | Escopo |
|---------|---------------|--------|
| `shared.css` | `index.css` via @import | Botões, forms, modais, summary cards, empty states, badges, animações |
| `layout.css` | `Layout.jsx` | Header, nav, page headers, month navigator |
| `balance.css` | `Balance.jsx` | Página de extrato |
| `cards.css` | `Cards.jsx`, `Subscriptions.jsx` | Página de cartões e mensalidades |
| `dashboard.css` | `Dashboard.jsx` | Dashboard |
| `invoice.css` | `Invoice.jsx` | Página de fatura |
| `profile.css` | `Profile.jsx` | Perfil |
| `auth.css` | Auth pages | Login, signup, forgot password |
| `loading.css` | `LoadingScreen.jsx` | Loading screen |

## Padrões compartilhados (shared.css)

- **Summary cards**: `.summary-card`, `.summary-label`, `.summary-value`
- **Empty states**: `.empty-state`, `.empty-state-title`, `.empty-state-description`
- **Section titles**: `.section-title` (com variante `.underlined`)
- **Badges**: `.badge.badge-success`, `.category-badge`
- **Loading**: `.loading-state`
- **Status de assinatura**: `.subscription-status.active/paused/ended`

## Related pages

- [[component-patterns]]
- [[architecture]]
