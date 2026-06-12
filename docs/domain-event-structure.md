# Estrutura de Domain Events (Pub/Sub)

Objetivo: permitir que Aggregates publiquem eventos de domínio sem depender diretamente dos serviços que irão reagir a esses eventos.

---

# Arquivos Base

Criar em `/core/events`:

```text
domain-event.ts
domain-events.ts
event-handler.ts
```

Responsabilidades:

```text
DomainEvent    → contrato do evento
EventHandler   → contrato do subscriber
DomainEvents   → gerencia publicação e execução
```

---

# Aggregate Root

Adicionar armazenamento de eventos:

```ts
private _domainEvents: DomainEvent[] = []
```

Getter:

```ts
get domainEvents() {
  return this._domainEvents
}
```

---

# Adicionando Eventos

Método responsável por registrar eventos:

```ts
protected addDomainEvent(
  domainEvent: DomainEvent,
): void {
  this._domainEvents.push(domainEvent)

  DomainEvents.markAggregateForDispatch(this)
}
```

Fluxo:

```text
Aggregate
    ↓
addDomainEvent()
    ↓
_domainEvents.push()
    ↓
markAggregateForDispatch()
```

O evento é apenas registrado, não executado.

---

# Limpando Eventos

Após o dispatch:

```ts
public clearEvents(): void {
  this._domainEvents = []
}
```

Evita que o mesmo evento seja processado novamente.

---

# Comparação de Entidades

Adicionar método `equals` na Entity:

```ts
equals(entity: Entity<any>) {
  if (entity === this) {
    return true
  }

  return entity.id.equals(this.id)
}
```

Permite comparar entidades pelo ID.

---

# Comparação de IDs

Adicionar método `equals` em `UniqueEntityID`:

```ts
equals(id: UniqueEntityID) {
  return id.toString() === this.toString()
}
```

Exemplo:

```ts
question.id.equals(answer.questionId)
```

---

# Utilização nas Watched Lists

Antes:

```ts
item.id.toString() === current.id.toString()
```

Depois:

```ts
item.id.equals(current.id)
```

Ou:

```ts
item.equals(current)
```

Código mais expressivo e orientado ao domínio.

---

# Fluxo Completo

```text
AggregateRoot
      ↓
addDomainEvent()
      ↓
_domainEvents
      ↓
markAggregateForDispatch()
      ↓
Repository salva Aggregate
      ↓
DomainEvents.dispatchEventsForAggregate()
      ↓
Subscribers executam ações
      ↓
clearEvents()
```

---

# Exemplo

Criação de resposta:

```ts
this.addDomainEvent(
  new AnswerCreatedEvent(this),
)
```

Após salvar:

```text
Resposta criada
      ↓
Evento registrado
      ↓
Repository salva
      ↓
Dispatch
      ↓
Subscriber executa
      ↓
Enviar notificação
```

Essa estrutura implementa o padrão Publish/Subscriber dentro do domínio, permitindo que Aggregates publiquem eventos e que outros componentes reajam a eles sem criar acoplamento direto.
