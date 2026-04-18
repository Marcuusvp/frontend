# Business Logic

**Summary**: Regras de negócio do app — motor de parcelas, assinaturas, saldo e fluxo de pagamento de faturas.

**Sources**: ProjectOverview.md

**Last updated**: 2026-04-17

---

## Motor de Parcelas (src/utils/installments.js)

Cada parcela tem seu mês de cobrança determinado pelo `closing_day` do cartão:

- Compras feitas **antes** do fechamento caem no mês atual
- Compras feitas **após** o fechamento shiftam para o mês seguinte
- A última parcela absorve arredondamento (soma de todas as parcelas = total exato da compra)

Também fornece `getCurrentMonthYear()` e `getRelevantInvoiceMonth(card)` para determinar qual fatura mostrar ao entrar na tela de invoice.

## Assinaturas (src/utils/subscriptions.js)

Filtra assinaturas ativas para um mês/alvo específico, considerando:
- Data de início (`start_date`)
- Data de término opcional (`end_date`)
- Flag `active`

Usado pela tela de Fatura para listar mensalidades que incidem no mês selecionado.

## Saldo (src/utils/balance.js)

Agregação de transações:
- `calculateTotalIncome()` — total de entradas
- `calculateTotalExpense()` — total de saídas
- `calculateBalance()` — saldo (entradas - saídas)
- `getTransactionTypeColor()` / `getTransactionTypeLabel()` — cores e labels por tipo

## Erros (src/utils/errors.js)

Mapeia códigos de erro do Supabase para mensagens amigáveis em português.

## Fluxo de Pagamento de Fatura (useInvoicePayments)

(state: ProjectOverview.md)

**Marcar como paga**:
1. Cria uma despesa em `balance_transactions` (debita do saldo)
2. Cria um registro em `invoice_payments`

**Desmarcar pagamento**:
1. Deleta o registro de `invoice_payments`
2. Deleta a despesa correspondente em `balance_transactions`

**Reabertura automática**: Adicionar uma compra a uma fatura já paga, se a data atual é anterior ao `closing_day`, desmarca a fatura automaticamente (reabre).

## Related pages

- [[data-model]]
- [[architecture]]
- [[component-patterns]]
