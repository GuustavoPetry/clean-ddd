# Evento de Domínio - AnswerCreatedEvent

Quando uma resposta (**Answer**) é criada, um **Domain Event** é registrado para informar ao sistema que algo importante aconteceu.

Esse evento pode ser utilizado posteriormente por Subscribers para executar ações como:

- Enviar notificações
- Atualizar métricas
- Criar logs
- Disparar integrações

---

## Criar `enterprise/events/answer-created-event.ts`

Cada evento é representado por uma classe própria.

### Propriedades

```ts
export class AnswerCreatedEvent implements DomainEvent {
  public ocurredAt: Date
  public answer: Answer
}
```

| Propriedade | Função |
|------------|---------|
| `occurredAt` | Data em que o evento ocorreu |
| `answer` | Entidade que originou o evento |

---

## Implementar `DomainEvent`

O construtor recebe a entidade criada e inicializa as propriedades do evento.

```ts
export class AnswerCreatedEvent implements DomainEvent {
  public ocurredAt: Date

  constructor(public answer: Answer) {
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.answer.id
  }
}
```

---

## Método `getAggregateId()`

Responsável por informar qual Aggregate Root gerou o evento.

```ts
getAggregateId(): UniqueEntityID {
  return this.answer.id
}
```

Isso permite que o sistema de eventos saiba qual agregado está relacionado ao evento disparado.

---

# Registrando o Evento na Entidade

Após criar a resposta, o evento deve ser adicionado à lista de eventos do Aggregate Root.

## Método `addDomainEvent()`

Adiciona um evento à fila de eventos da entidade.

```ts
this.addDomainEvent(
  new AnswerCreatedEvent(this)
)
```

---

## Registrar Evento no `create()`

Quando uma nova resposta é criada, o evento é registrado automaticamente.

```ts
static create(
  props: AnswerProps,
  id?: UniqueEntityID,
) {
  const answer = new Answer(props, id)

  answer.addDomainEvent(
    new AnswerCreatedEvent(answer)
  )

  return answer
}
```

---

# Fluxo Completo

```text
Answer.create()
       │
       ▼
AnswerCreatedEvent é criado
       │
       ▼
addDomainEvent()
       │
       ▼
Evento fica armazenado no Aggregate
       │
       ▼
DomainEvents.dispatchEventsForAggregate()
       │
       ▼
Subscribers recebem o evento
       │
       ├─► Enviar notificação
       ├─► Criar log
       └─► Atualizar métricas
```

---

# Resumo

- Cada acontecimento importante do domínio gera um **Domain Event**.
- `AnswerCreatedEvent` representa a criação de uma resposta.
- O construtor recebe a entidade criada e define `occurredAt`.
- `getAggregateId()` retorna o ID da resposta.
- A entidade registra o evento usando `addDomainEvent()`.
- O evento fica aguardando até ser despachado para os Subscribers.
- Isso implementa o padrão **Pub/Sub**, reduzindo acoplamento entre as regras de negócio.