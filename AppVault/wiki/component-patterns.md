# Component Patterns

**Summary**: Padrões reutilizáveis de componentes — forms, modais, loading, empty states e ações.

**Sources**: ProjectOverview.md

**Last updated**: 2026-04-17

---

## Padrão de página

Todas as páginas seguem o fluxo:

```
LoadingScreen → ErrorState → (EmptyState | Data list)
```

Named exports (não default exports) em todas as páginas.

## Modais

Forms são modal overlays com classes `modal-overlay` / `modal-content`. Estrutura:

```
modal-overlay (backdrop com blur)
  modal-content (card branco)
    modal-header (título + botão fechar)
    card-form (formulário)
      form-group → label + input
      form-row → grid 2 colunas
    modal-actions (botões cancelar/salvar)
```

Forms: `CardForm`, `PurchaseForm`, `SubscriptionForm`, `BalanceTransactionForm`.

## getInitialFormData()

Factory que gera estado inicial do form a partir de uma entidade opcional:

```js
const getInitialFormData = (entity) => ({
  field: entity?.field ?? '',
  // ...
})
```

Usado para criar novo e editar existente com o mesmo form.

## Componentes compartilhados

- **DeleteConfirmModal**: modal de confirmação de exclusão, reutilizado em Cards, Subscriptions, Purchases, BalanceTransactions
- **MonthNavigator**: navegação mês anterior/próximo, usado em Invoice e Balance
- **EmptyState**: estado vazio reutilizável com ícone, título, descrição e CTA
- **LoadingScreen**: tela de loading full-page
- **ErrorState**: estado de erro com botão retry

## Action buttons

Botões de editar/excluir usam `.card-action-btn.edit` e `.card-action-btn.delete`, compartilhados entre todas as listas (cards, assinaturas, compras, transações).

## Related pages

- [[architecture]]
- [[styling]]
- [[business-logic]]
