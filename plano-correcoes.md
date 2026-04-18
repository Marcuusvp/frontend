# Plano de Correções — Finanças App

> RLS do Supabase já concluído. Este documento cobre os demais itens, organizados por prioridade.

---

## Sumário

| # | Item | Arquivo(s) | Impacto | Esforço |
|---|------|------------|---------|---------|
| 1 | Race condition no `fetchPayment` | `useInvoicePayments.js` | Bug silencioso | ~30min |
| 2 | Centralizar parse de datas | `utils/date.js` + 5 arquivos | Bug potencial | ~1h |
| 3 | Bug `endDate` em meses curtos | `useBalanceTransactions.js` | Bug concreto | ~20min |
| 4 | `Promise.all` no `useDashboard` | `useDashboard.js` | Performance | ~30min |
| 5 | State órfão após `deleteCard` | `Cards.jsx` | UX menor | ~20min |
| 6 | Hook `useMonthNavigation` | `Invoice.jsx`, `Balance.jsx` | Duplicação | ~45min |
| 7 | Testes com Vitest | `utils/*.test.js` | Confiança | ~2h |
| 8 | Ajustes cosméticos | `index.html` | Qualidade | ~5min |

---

## 1. Race condition no `fetchPayment`

### Contexto

Na tela de Invoice, ao trocar de mês rapidamente, múltiplas chamadas a `fetchPayment` são disparadas. A resposta de uma request antiga pode chegar **depois** da mais recente, sobrescrevendo o state com dado de um mês errado. O usuário veria o status de pagamento incorreto sem nenhum erro visível.

### Arquivo

`src/hooks/useInvoicePayments.js`

### Implementação

Usar uma `ref` para controlar qual é a request mais recente. Qualquer resposta de request obsoleta é descartada silenciosamente.

```js
// src/hooks/useInvoicePayments.js
import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useInvoicePayments() {
  const [payment, setPayment] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Contador que identifica a request mais recente
  const requestIdRef = useRef(0)

  const fetchPayment = useCallback(async (cardId, month, year) => {
    if (!user || !cardId) return

    // Incrementa o ID desta request
    const requestId = ++requestIdRef.current

    try {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('card_id', cardId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

      if (error) throw error

      // Só atualiza o state se esta ainda for a request mais recente
      if (requestId === requestIdRef.current) {
        setPayment(data)
      }

      return data
    } catch (err) {
      if (requestId === requestIdRef.current) {
        console.error('Erro ao buscar pagamento:', err)
      }
      return null
    }
  }, [user])

  // ... restante do hook sem alterações
}
```

### O que NÃO mudar

`markAsPaid`, `unmarkAsPaid` e `fetchPaymentsForCards` não precisam de proteção contra race condition pois são ações explícitas do usuário, não automáticas.

---

## 2. Centralizar parse de datas

### Contexto

O trecho `new Date(dateStr + 'T00:00:00')` aparece repetido em pelo menos 5 arquivos. Ele existe para evitar o problema de UTC offset (sem o sufixo de hora, o JS interpreta a data como UTC e pode mostrar o dia anterior em fusos negativos). O problema é que está duplicado e sem documentação — qualquer mudança no formato retornado pelo Supabase quebraria silenciosamente.

### Arquivos afetados

- `src/utils/balance.js`
- `src/utils/subscriptions.js`
- `src/utils/installments.js`
- `src/pages/Balance.jsx`
- `src/pages/Invoice.jsx`

### Passo 1 — Criar o utilitário

```js
// src/utils/date.js

/**
 * Faz parse seguro de datas vindas do Supabase.
 *
 * Datas simples (YYYY-MM-DD) são interpretadas pelo JS como UTC,
 * o que causa um shift de um dia em fusos negativos (ex: Brasil GMT-3).
 * Adicionar T00:00:00 força a interpretação como horário local.
 *
 * @param {string|null} dateStr - Data no formato YYYY-MM-DD ou ISO 8601
 * @returns {Date|null}
 */
export function parseSupabaseDate(dateStr) {
  if (!dateStr) return null
  if (dateStr.includes('T')) return new Date(dateStr)
  return new Date(dateStr + 'T00:00:00')
}

/**
 * Verifica se uma data pertence a um mês/ano específico.
 *
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {boolean}
 */
export function isDateInMonth(dateStr, month, year) {
  const date = parseSupabaseDate(dateStr)
  if (!date) return false
  return date.getMonth() + 1 === month && date.getFullYear() === year
}

/**
 * Retorna true se dateStr é anterior a referenceDate.
 *
 * @param {string} dateStr
 * @param {Date} referenceDate
 * @returns {boolean}
 */
export function isDateBefore(dateStr, referenceDate) {
  const date = parseSupabaseDate(dateStr)
  if (!date) return false
  return date < referenceDate
}

/**
 * Retorna true se dateStr é posterior a referenceDate.
 *
 * @param {string} dateStr
 * @param {Date} referenceDate
 * @returns {boolean}
 */
export function isDateAfter(dateStr, referenceDate) {
  const date = parseSupabaseDate(dateStr)
  if (!date) return false
  return date > referenceDate
}
```

### Passo 2 — Substituir nos arquivos afetados

**`src/utils/balance.js`**

```js
// Antes
import { filterTransactionsByMonth } from './balance'

export function filterTransactionsByMonth(transactions, month, year) {
  return transactions.filter(t => {
    const date = new Date(t.date + 'T00:00:00')   // <- remover
    return date.getMonth() + 1 === month && date.getFullYear() === year
  })
}

// Depois
import { isDateInMonth } from './date'

export function filterTransactionsByMonth(transactions, month, year) {
  return transactions.filter(t => isDateInMonth(t.date, month, year))
}
```

**`src/utils/subscriptions.js`**

```js
// Antes
const startDate = new Date(sub.start_date + 'T00:00:00')  // <- remover
if (sub.end_date) {
  const endDate = new Date(sub.end_date + 'T00:00:00')    // <- remover
}

// Depois
import { parseSupabaseDate } from './date'

const startDate = parseSupabaseDate(sub.start_date)
if (sub.end_date) {
  const endDate = parseSupabaseDate(sub.end_date)
}
```

**`src/pages/Balance.jsx`**

```js
// Antes
const monthlyTransactions = useMemo(() => {
  return transactions.filter((t) => {
    const date = new Date(t.date + 'T00:00:00')  // <- remover
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })
}, [transactions, currentMonth, currentYear])

// Depois
import { isDateInMonth } from '../utils/date'

const monthlyTransactions = useMemo(() => {
  return transactions.filter(t => isDateInMonth(t.date, currentMonth, currentYear))
}, [transactions, currentMonth, currentYear])
```

**`src/pages/Balance.jsx` — totalBalance**

```js
// Antes
const pastTransactions = transactions.filter((t) => {
  const date = new Date(t.date + 'T00:00:00')  // <- remover
  const currentDate = new Date(currentYear, currentMonth - 1, 31)
  return date <= currentDate
})

// Depois
import { parseSupabaseDate } from '../utils/date'

const pastTransactions = transactions.filter((t) => {
  const date = parseSupabaseDate(t.date)
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0) // último dia real do mês
  return date <= lastDayOfMonth
})
```

**`src/pages/Invoice.jsx`**

```js
// Antes
.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))

// Depois
import { parseSupabaseDate } from '../utils/date'
.sort((a, b) => parseSupabaseDate(b.purchase_date) - parseSupabaseDate(a.purchase_date))
```

---

## 3. Bug `endDate` em meses curtos

### Contexto

Em `useBalanceTransactions.js`, o `fetchTransactionsByMonth` constrói a data final do mês com `-31` hardcoded. Fevereiro tem 28 ou 29 dias, abril/junho/setembro/novembro têm 30. O Supabase ignora datas inexistentes (ex: `2024-02-31`) sem erro, mas o filtro pode excluir os últimos dias do mês silenciosamente dependendo da implementação do banco.

### Arquivo

`src/hooks/useBalanceTransactions.js`

### Implementação

```js
const fetchTransactionsByMonth = useCallback(async (month, year) => {
  if (!user) return

  setLoading(true)
  setError(null)

  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`

    // Calcular o último dia real do mês
    // new Date(year, month, 0) retorna o último dia do mês anterior a 'month+1',
    // ou seja, o último dia de 'month'.
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const { data, error } = await supabase
      .from('balance_transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    setTransactions(data || [])
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [user])
```

### Casos que passam a funcionar corretamente

| Mês | Antes (`-31`) | Depois |
|-----|--------------|--------|
| Fevereiro 2024 | `2024-02-31` (inválido) | `2024-02-29` |
| Abril | `2024-04-31` (inválido) | `2024-04-30` |
| Dezembro | `2024-12-31` (correto por acaso) | `2024-12-31` |

---

## 4. `Promise.all` no `useDashboard`

### Contexto

O hook atualmente faz as queries de forma sequencial: cards → purchases → subscriptions → transactions → invoice_payments. As quatro primeiras não dependem umas das outras e podem ser feitas em paralelo. A quinta (invoice_payments) depende dos IDs dos cards, mas pode ser iniciada assim que cards retornar, sem esperar as outras três.

### Arquivo

`src/hooks/useDashboard.js`

### Implementação

```js
const fetchDashboardData = useCallback(async () => {
  if (!user) return

  setLoading(true)
  setError(null)

  try {
    // Dispara as 4 queries independentes em paralelo
    const [
      { data: cardsData,         error: cardsError },
      { data: purchasesData,     error: purchasesError },
      { data: subscriptionsData, error: subscriptionsError },
      { data: transactionsData,  error: transactionsError },
    ] = await Promise.all([
      supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('purchases')
        .select('*'),
      supabase
        .from('subscriptions')
        .select('*'),
      supabase
        .from('balance_transactions')
        .select('*')
        .order('date', { ascending: false }),
    ])

    // Verifica erros de qualquer uma das queries
    const firstError = cardsError || purchasesError || subscriptionsError || transactionsError
    if (firstError) throw firstError

    // invoice_payments depende dos card IDs — busca separada mas imediata
    let paymentsData = []
    if (cardsData?.length > 0) {
      const { data, error: paymentsError } = await supabase
        .from('invoice_payments')
        .select('*')
        .in('card_id', cardsData.map(c => c.id))

      if (paymentsError) throw paymentsError
      paymentsData = data || []
    }

    setCards(cardsData || [])
    setPurchases(purchasesData || [])
    setSubscriptions(subscriptionsData || [])
    setTransactions(transactionsData || [])
    setInvoicePayments(paymentsData)

  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [user])
```

### Ganho esperado

As 4 queries paralelas rodam no tempo da mais lenta, não na soma das quatro. Em condições normais de rede (~100-200ms por query), o carregamento do dashboard cai de ~400-800ms para ~100-200ms.

---

## 5. State órfão após `deleteCard`

### Contexto

Ao deletar um cartão em `Cards.jsx`, o hook `useCards` remove o item do seu state local corretamente. Porém, se `usePurchases` ou `useSubscriptions` estiverem instanciados em algum contexto pai ou compartilhado, eles ainda guardam em memória os registros vinculados ao cartão deletado. Na prática atual, como cada página instancia seus próprios hooks, isso não causa exibição de dados fantasma — mas é uma bomba-relógio para quando a arquitetura evoluir.

### Arquivo

`src/pages/Cards.jsx`

### Implementação (solução defensiva)

Após o delete bem-sucedido, navegar para `/cards` (a própria página) forçando remontagem, ou simplesmente garantir que o feedback ao usuário seja claro e que a navegação para Invoice de um cartão deletado seja bloqueada.

```js
// src/pages/Cards.jsx
const handleConfirmDelete = async () => {
  if (!deletingCard) return

  const result = await deleteCard(deletingCard.id)

  if (!result.error) {
    setDeletingCard(null)
    toast.success(`Cartão "${deletingCard.name}" excluído.`)
    // O navigate força remontagem da página e re-fetch de todos os hooks
    // Alternativa: window.location.reload() — menos elegante mas igualmente efetivo
    navigate('/cards', { replace: true })
  }

  return result
}
```

> **Nota:** Quando/se React Query for adotado (ver item 7), isso é resolvido com `invalidateQueries` de forma mais limpa.

---

## 6. Hook `useMonthNavigation`

### Contexto

A lógica de navegação entre meses (incrementar/decrementar com virada de ano) está duplicada em `Invoice.jsx` e `Balance.jsx` — são blocos de ~12 linhas idênticos em cada arquivo. Qualquer correção de bug precisa ser feita nos dois lugares.

### Passo 1 — Criar o hook

```js
// src/hooks/useMonthNavigation.js

import { useState } from 'react'

/**
 * Gerencia o estado de mês/ano atual com navegação prev/next.
 *
 * @param {number} [initialMonth] - Mês inicial (1-12). Default: mês atual.
 * @param {number} [initialYear]  - Ano inicial. Default: ano atual.
 */
export function useMonthNavigation(initialMonth, initialYear) {
  const now = new Date()

  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1)
  const [year, setYear]   = useState(initialYear  ?? now.getFullYear())

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  /**
   * Define mês e ano simultaneamente (usado para ajuste inicial).
   */
  const setMonthYear = (newMonth, newYear) => {
    setMonth(newMonth)
    setYear(newYear)
  }

  return { month, year, goToPrevMonth, goToNextMonth, setMonthYear }
}
```

### Passo 2 — Usar em `Balance.jsx`

```js
// Antes
const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1)
const [currentYear, setCurrentYear]   = useState(() => new Date().getFullYear())

const handlePrevMonth = () => {
  if (currentMonth === 1) {
    setCurrentMonth(12)
    setCurrentYear((prev) => prev - 1)
  } else {
    setCurrentMonth((prev) => prev - 1)
  }
}

const handleNextMonth = () => {
  if (currentMonth === 12) {
    setCurrentMonth(1)
    setCurrentYear((prev) => prev + 1)
  } else {
    setCurrentMonth((prev) => prev + 1)
  }
}

// Depois
import { useMonthNavigation } from '../hooks/useMonthNavigation'

const {
  month: currentMonth,
  year: currentYear,
  goToPrevMonth: handlePrevMonth,
  goToNextMonth: handleNextMonth,
} = useMonthNavigation()
```

### Passo 3 — Usar em `Invoice.jsx`

```js
// Antes
const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear().month)
const [currentYear, setCurrentYear]   = useState(getCurrentMonthYear().year)
const [initialMonthSet, setInitialMonthSet] = useState(false)

useEffect(() => {
  if (card && !initialMonthSet) {
    const { month, year } = getRelevantInvoiceMonth(card)
    setCurrentMonth(month)
    setCurrentYear(year)
    setInitialMonthSet(true)
  }
}, [card, initialMonthSet])

const handlePrevMonth = () => { /* 6 linhas */ }
const handleNextMonth = () => { /* 6 linhas */ }

// Depois
import { useMonthNavigation } from '../hooks/useMonthNavigation'

const {
  month: currentMonth,
  year: currentYear,
  goToPrevMonth: handlePrevMonth,
  goToNextMonth: handleNextMonth,
  setMonthYear,
} = useMonthNavigation()

const [initialMonthSet, setInitialMonthSet] = useState(false)

useEffect(() => {
  if (card && !initialMonthSet) {
    const { month, year } = getRelevantInvoiceMonth(card)
    setMonthYear(month, year)
    setInitialMonthSet(true)
  }
}, [card, initialMonthSet, setMonthYear])
```

---

## 7. Testes com Vitest

### Contexto

`installments.js` e `subscriptions.js` contêm a lógica de negócio mais crítica do app — são elas que determinam o valor que o usuário vê na fatura. Um bug de arredondamento ou de tratamento de virada de ano é difícil de detectar manualmente. Testes automatizados garantem que refatorações futuras não quebrem comportamentos existentes.

### Passo 1 — Instalar

```bash
npm install -D vitest @vitest/ui
```

### Passo 2 — Configurar

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

```json
// package.json — adicionar nos scripts
{
  "scripts": {
    "test":    "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

### Passo 3 — Testes de `installments.js`

```js
// src/utils/installments.test.js
import { describe, it, expect } from 'vitest'
import { calculateInstallments } from './installments'

const card = { closing_day: 10 }

describe('calculateInstallments', () => {

  it('compra antes do fechamento cai no mês atual', () => {
    const purchase = { purchase_date: '2024-04-05', total_amount: 300, installments: 3 }
    const result = calculateInstallments(purchase, card)

    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({ month: 4, year: 2024, installmentNumber: 1 })
    expect(result[1]).toMatchObject({ month: 5, year: 2024, installmentNumber: 2 })
    expect(result[2]).toMatchObject({ month: 6, year: 2024, installmentNumber: 3 })
  })

  it('compra após o fechamento vai para o mês seguinte', () => {
    const purchase = { purchase_date: '2024-04-15', total_amount: 200, installments: 2 }
    const result = calculateInstallments(purchase, card)

    expect(result[0]).toMatchObject({ month: 5, year: 2024 })
    expect(result[1]).toMatchObject({ month: 6, year: 2024 })
  })

  it('compra em dezembro após fechamento vai para janeiro do ano seguinte', () => {
    const purchase = { purchase_date: '2024-12-15', total_amount: 300, installments: 3 }
    const result = calculateInstallments(purchase, card)

    expect(result[0]).toMatchObject({ month: 1, year: 2025 })
    expect(result[1]).toMatchObject({ month: 2, year: 2025 })
    expect(result[2]).toMatchObject({ month: 3, year: 2025 })
  })

  it('virada de ano no meio das parcelas', () => {
    const purchase = { purchase_date: '2024-10-05', total_amount: 300, installments: 4 }
    const result = calculateInstallments(purchase, card)

    expect(result[0]).toMatchObject({ month: 10, year: 2024 })
    expect(result[1]).toMatchObject({ month: 11, year: 2024 })
    expect(result[2]).toMatchObject({ month: 12, year: 2024 })
    expect(result[3]).toMatchObject({ month: 1,  year: 2025 })
  })

  it('última parcela absorve o arredondamento e o total bate exato', () => {
    const purchase = { purchase_date: '2024-04-05', total_amount: 100, installments: 3 }
    const result = calculateInstallments(purchase, card)

    const soma = result.reduce((acc, i) => acc + i.amount, 0)
    expect(Math.round(soma * 100) / 100).toBe(100)
    // Última parcela é ligeiramente maior por absorver centavos
    expect(result[2].amount).toBeGreaterThanOrEqual(result[0].amount)
  })

  it('parcela única retorna array com um elemento', () => {
    const purchase = { purchase_date: '2024-04-05', total_amount: 150, installments: 1 }
    const result = calculateInstallments(purchase, card)

    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(150)
  })

  it('compra exatamente no dia do fechamento cai no mês atual', () => {
    const purchase = { purchase_date: '2024-04-10', total_amount: 100, installments: 1 }
    const result = calculateInstallments(purchase, card)

    // Dia 10 = dia de fechamento → ainda cai no mês atual (não ultrapassa)
    expect(result[0]).toMatchObject({ month: 4, year: 2024 })
  })

  it('closing_day maior que dias do mês é tratado sem erro (fevereiro)', () => {
    const cardFev = { closing_day: 30 }
    const purchase = { purchase_date: '2024-02-15', total_amount: 100, installments: 1 }

    expect(() => calculateInstallments(purchase, cardFev)).not.toThrow()
  })

  it('retorna array vazio se dados obrigatórios estão faltando', () => {
    expect(calculateInstallments({ purchase_date: null, total_amount: 100, installments: 1 }, card)).toEqual([])
    expect(calculateInstallments({ purchase_date: '2024-04-05', total_amount: null, installments: 1 }, card)).toEqual([])
  })

})
```

### Passo 4 — Testes de `subscriptions.js`

```js
// src/utils/subscriptions.test.js
import { describe, it, expect } from 'vitest'
import { getSubscriptionsForMonth, getSubscriptionStatus } from './subscriptions'

const subBase = {
  active: true,
  start_date: '2024-01-01',
  end_date: null,
  amount: 50,
  billing_day: 5,
}

describe('getSubscriptionsForMonth', () => {

  it('retorna assinatura ativa sem data de término', () => {
    const result = getSubscriptionsForMonth([subBase], 6, 2024)
    expect(result).toHaveLength(1)
  })

  it('não retorna assinatura com active = false', () => {
    const paused = { ...subBase, active: false }
    expect(getSubscriptionsForMonth([paused], 6, 2024)).toHaveLength(0)
  })

  it('não retorna se start_date é posterior ao mês alvo', () => {
    const future = { ...subBase, start_date: '2024-08-01' }
    expect(getSubscriptionsForMonth([future], 6, 2024)).toHaveLength(0)
  })

  it('retorna se start_date é exatamente o primeiro dia do mês alvo', () => {
    const exact = { ...subBase, start_date: '2024-06-01' }
    expect(getSubscriptionsForMonth([exact], 6, 2024)).toHaveLength(1)
  })

  it('não retorna se end_date terminou antes do mês alvo', () => {
    const ended = { ...subBase, end_date: '2024-05-31' }
    expect(getSubscriptionsForMonth([ended], 6, 2024)).toHaveLength(0)
  })

  it('retorna se end_date é dentro do mês alvo', () => {
    const endingMidMonth = { ...subBase, end_date: '2024-06-15' }
    expect(getSubscriptionsForMonth([endingMidMonth], 6, 2024)).toHaveLength(1)
  })

  it('retorna se end_date é o último dia do mês alvo', () => {
    const endingLastDay = { ...subBase, end_date: '2024-06-30' }
    expect(getSubscriptionsForMonth([endingLastDay], 6, 2024)).toHaveLength(1)
  })

  it('retorna array vazio para lista vazia', () => {
    expect(getSubscriptionsForMonth([], 6, 2024)).toEqual([])
  })

  it('retorna array vazio para input inválido', () => {
    expect(getSubscriptionsForMonth(null, 6, 2024)).toEqual([])
    expect(getSubscriptionsForMonth(undefined, 6, 2024)).toEqual([])
  })

  it('filtra corretamente múltiplas assinaturas', () => {
    const subs = [
      subBase,                                         // ativa → inclui
      { ...subBase, active: false },                   // pausada → exclui
      { ...subBase, end_date: '2024-05-01' },          // encerrada → exclui
      { ...subBase, start_date: '2024-07-01' },        // futura → exclui
    ]
    expect(getSubscriptionsForMonth(subs, 6, 2024)).toHaveLength(1)
  })

})

describe('getSubscriptionStatus', () => {

  it('retorna "active" para assinatura ativa sem fim', () => {
    expect(getSubscriptionStatus(subBase)).toBe('active')
  })

  it('retorna "paused" para active = false', () => {
    expect(getSubscriptionStatus({ ...subBase, active: false })).toBe('paused')
  })

  it('retorna "ended" para assinatura com end_date no passado', () => {
    const ended = { ...subBase, end_date: '2020-01-01' }
    expect(getSubscriptionStatus(ended)).toBe('ended')
  })

  it('retorna "active" para end_date no futuro', () => {
    const future = { ...subBase, end_date: '2099-12-31' }
    expect(getSubscriptionStatus(future)).toBe('active')
  })

})
```

### Passo 5 — Testes de `date.js` (após criar o utilitário do item 2)

```js
// src/utils/date.test.js
import { describe, it, expect } from 'vitest'
import { parseSupabaseDate, isDateInMonth } from './date'

describe('parseSupabaseDate', () => {

  it('faz parse de data simples sem shift de timezone', () => {
    const date = parseSupabaseDate('2024-03-15')
    expect(date.getDate()).toBe(15)
    expect(date.getMonth()).toBe(2) // março = índice 2
    expect(date.getFullYear()).toBe(2024)
  })

  it('retorna null para input nulo', () => {
    expect(parseSupabaseDate(null)).toBeNull()
    expect(parseSupabaseDate(undefined)).toBeNull()
    expect(parseSupabaseDate('')).toBeNull()
  })

  it('aceita ISO 8601 com hora', () => {
    const date = parseSupabaseDate('2024-03-15T10:30:00')
    expect(date).toBeInstanceOf(Date)
    expect(date.getFullYear()).toBe(2024)
  })

})

describe('isDateInMonth', () => {

  it('retorna true para data dentro do mês', () => {
    expect(isDateInMonth('2024-06-15', 6, 2024)).toBe(true)
  })

  it('retorna false para mês diferente', () => {
    expect(isDateInMonth('2024-07-01', 6, 2024)).toBe(false)
  })

  it('retorna false para ano diferente', () => {
    expect(isDateInMonth('2023-06-15', 6, 2024)).toBe(false)
  })

})
```

### Rodar os testes

```bash
# Modo watch (desenvolvimento)
npm test

# Rodar uma vez (CI)
npm run test:run

# Interface visual
npm run test:ui
```

---

## 8. Ajustes cosméticos

São alterações de 2 linhas mas que impactam acessibilidade, SEO e comportamento do browser.

### `index.html`

```html
<!-- Antes -->
<html lang="en">
  <head>
    <title>frontend</title>

<!-- Depois -->
<html lang="pt-BR">
  <head>
    <title>Finanças</title>
```

**Por que importa:**
- `lang="pt-BR"` ativa correção ortográfica correta do browser, leitores de tela usam a voz certa, e motores de busca indexam no idioma correto.
- `title` aparece na aba do browser, em bookmarks e em resultados de busca.

---

## Ordem de execução recomendada

```
Semana 1 (bugs concretos — baixo risco):
  ✅ RLS Supabase (concluído)
  3 → Bug endDate (20min, isolado, sem dependências)
  1 → Race condition fetchPayment (30min, isolado)
  8 → Ajustes cosméticos (5min)

Semana 2 (refatoração — médio risco):
  2 → Centralizar datas (1h — toca vários arquivos, fazer branch separado)
  4 → Promise.all no dashboard (30min)
  5 → State após deleteCard (20min)

Semana 3 (qualidade):
  6 → useMonthNavigation (45min)
  7 → Testes Vitest (2h)
```

---

*Total estimado (excluindo RLS): ~6-7h de trabalho focado.*
