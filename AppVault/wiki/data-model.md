# Data Model

**Summary**: Tabelas Supabase e suas relações no app Finanças.

**Sources**: ProjectOverview.md

**Last updated**: 2026-04-17

---

## Tabelas

### `cards`
Cartões de crédito do usuário. Campos incluem nome, cor, dia de fechamento (`closing_day`), dia de vencimento (`due_day`). Cada cartão tem faturas mensais.

### `purchases`
Compras feitas nos cartões. Podem ser parceladas (`installments`). A data de compra e o `closing_day` do cartão determinam em qual mês cada parcela cai (ver [[business-logic]]).

- Relaciona com `cards` via `card_id`

### `subscriptions`
Assinaturas/mensalidades recorrentes vinculadas a um cartão. Têm data de início (`start_date`), término opcional (`end_date`), dia de cobrança (`billing_day`) e flag `active`.

- Relaciona com `cards` via `card_id`

### `balance_transactions`
Transações de entrada/saída do saldo bancário (não relacionadas a cartões). Tipos: `income` (entrada) e `expense` (saída).

### `invoice_payments`
Registro de pagamento de fatura. Ao marcar uma fatura como paga, cria-se tanto um registro aqui quanto uma despesa em `balance_transactions` (ver [[business-logic]]).

- Relaciona com `cards` via `card_id`
- Campos: `month`, `year`, `amount`

## Relações

```
cards 1──N purchases
cards 1──N subscriptions
cards 1──N invoice_payments
balance_transactions (independente)
invoice_payments 1──1 balance_transactions (criados juntos no pagamento)
```

## Hooks por tabela

| Tabela | Hooks |
|--------|-------|
| `cards` | useCards, useDashboard |
| `purchases` | usePurchases, useDashboard |
| `subscriptions` | useSubscriptions, useDashboard |
| `balance_transactions` | useBalanceTransactions, useDashboard, useInvoicePayments |
| `invoice_payments` | useInvoicePayments, useDashboard |

## Related pages

- [[architecture]]
- [[business-logic]]
- [[project-overview]]
