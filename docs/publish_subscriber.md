# Pub/Sub com Domain Events no DDD

## Objetivo

Permitir que uma ação ocorrida em um Aggregate (ex: criação de uma resposta) dispare outras ações sem que a entidade ou o caso de uso conheçam essas implementações.

Exemplo:

```txt
Usuário cria uma resposta
        ↓
AnswerCreatedEvent
        ↓
OnAnswerCreated
        ↓
Cria uma notificação
```

A entidade não sabe que notificações existem.

---

# Fluxo Completo

```txt
OnAnswerCreated
    ↓
register()
    ↓
handlersMap

────────────────────────────

Service.execute()
    ↓
Answer.create()
    ↓
addDomainEvent()
    ↓
_domainEvents

────────────────────────────

Repository.create()
    ↓
salva entidade
    ↓
dispatchEventsForAggregate()
    ↓
AnswerCreatedEvent
    ↓
dispatch()
    ↓
handlersMap["AnswerCreatedEvent"]
    ↓
OnAnswerCreated.execute()
    ↓
Notification.create()
    ↓
clearEvents()
```

---

# 1. Registro do Handler

## Classe

```ts
export class OnAnswerCreated {
    constructor() {
        DomainEvents.register(
            this.sendNotification.bind(this),
            AnswerCreatedEvent.name,
        );
    }

    private sendNotification(event: AnswerCreatedEvent) {
        // cria notificação
    }
}
```

## O que acontece?

Quando a aplicação inicia:

```ts
new OnAnswerCreated();
```

O construtor é executado.

Dentro dele ocorre:

```ts
DomainEvents.register(...)
```

---

## register()

```ts
public static register(
    callback: DomainEventCallback,
    eventClassName: string,
) {
    if (!(eventClassName in this.handlersMap)) {
        this.handlersMap[eventClassName] = [];
    }

    this.handlersMap[eventClassName].push(callback);
}
```

Adiciona o callback ao mapa de handlers.

Resultado:

```ts
handlersMap = {
    AnswerCreatedEvent: [
        sendNotification
    ]
}
```

---

# 2. Service é Executado

## Exemplo

```ts
async execute() {
    const answer = Answer.create({
        content: "Minha resposta"
    });

    await answerRepository.create(answer);
}
```

O service não conhece eventos.

Ele apenas cria a entidade e salva.

---

# 3. Criação da Entidade

## Answer.create()

```ts
static create(props: AnswerProps, id?: UniqueEntityID) {
    const answer = new Answer(props, id);

    const isNewAnswer = !id;

    if (isNewAnswer) {
        answer.addDomainEvent(
            new AnswerCreatedEvent(answer)
        );
    }

    return answer;
}
```

---

## O que acontece?

Ao criar uma nova Answer:

```ts
Answer.create(...)
```

é criado um evento:

```ts
new AnswerCreatedEvent(answer)
```

e enviado para:

```ts
addDomainEvent()
```

---

# 4. addDomainEvent()

Método herdado de AggregateRoot.

```ts
public addDomainEvent(event: DomainEvent) {
    this._domainEvents.push(event);

    DomainEvents.markAggregateForDispatch(this);
}
```

---

## Responsabilidades

### Adicionar evento

```ts
this._domainEvents.push(event);
```

Resultado:

```ts
answer.domainEvents = [
    AnswerCreatedEvent
]
```

---

### Marcar Aggregate

```ts
DomainEvents.markAggregateForDispatch(this);
```

Adiciona o aggregate em:

```ts
DomainEvents.markedAggregates
```

Resultado:

```ts
markedAggregates = [
    answer
]
```

---

# 5. Repository Salva

## Exemplo

```ts
async create(answer: Answer) {
    this.items.push(answer);

    DomainEvents.dispatchEventsForAggregate(
        answer.id
    );
}
```

Após salvar, dispara os eventos.

---

# 6. dispatchEventsForAggregate()

```ts
public static dispatchEventsForAggregate(
    aggregateId: UniqueEntityID
) {
    const aggregate = this.markedAggregates.find(
        item => item.id.equals(aggregateId)
    );

    if (aggregate) {
        this.dispatchAggregateEvents(aggregate);

        aggregate.clearEvents();

        this.removeAggregateFromMarkedDispatchList(
            aggregate.id
        );
    }
}
```

---

## O que acontece?

### Procura o Aggregate

Busca dentro de:

```ts
markedAggregates
```

---

### Dispara eventos

```ts
dispatchAggregateEvents(aggregate)
```

---

### Limpa eventos

```ts
aggregate.clearEvents()
```

Resultado:

```ts
answer.domainEvents = []
```

Evita disparar novamente.

---

# 7. dispatchAggregateEvents()

```ts
private static dispatchAggregateEvents(
    aggregate: AggregateRoot<any>
) {
    aggregate.domainEvents.forEach(event => {
        this.dispatch(event);
    });
}
```

Percorre:

```ts
aggregate.domainEvents
```

Exemplo:

```ts
[
    AnswerCreatedEvent
]
```

Para cada evento chama:

```ts
dispatch(event)
```

---

# 8. dispatch()

```ts
private static dispatch(event: DomainEvent) {
    const eventClassName =
        event.constructor.name;

    const isEventRegistered =
        eventClassName in this.handlersMap;

    if (isEventRegistered) {
        this.handlersMap[eventClassName]
            ?.forEach(handler => {
                handler(event);
            });
    }
}
```

---

## O que acontece?

Obtém o nome da classe:

```ts
event.constructor.name
```

Resultado:

```ts
"AnswerCreatedEvent"
```

---

Busca os handlers:

```ts
handlersMap["AnswerCreatedEvent"]
```

Resultado:

```ts
[
    sendNotification
]
```

---

Executa todos:

```ts
handler(event)
```

Equivalente a:

```ts
sendNotification(event)
```

---

# 9. Handler Executa

## OnAnswerCreated

```ts
private async sendNotification(
    event: AnswerCreatedEvent
) {
    await notificationRepository.create(
        Notification.create(...)
    );
}
```

Agora a notificação é criada.

---

# Resumo das Responsabilidades

## Service

```txt
Cria entidade
Salva entidade
```

Não conhece eventos.

---

## Aggregate

```txt
Gera Domain Events
```

Exemplo:

```txt
AnswerCreatedEvent
```

---

## AggregateRoot

```txt
Armazena Domain Events
Marca Aggregate para dispatch
```

---

## Repository

```txt
Persiste Aggregate
Dispara eventos após persistir
```

---

## DomainEvents

```txt
Registra handlers
Controla agregados marcados
Dispara eventos
Executa handlers
```

---

## Event Handler

```txt
Escuta eventos
Executa ações secundárias
```

Exemplo:

```txt
Criar notificação
Enviar email
Atualizar métricas
Publicar webhook
```

---

# Benefício Principal

Sem Pub/Sub:

```txt
Service
 ├─ cria resposta
 ├─ cria notificação
 ├─ envia email
 └─ atualiza métricas
```

Com Pub/Sub:

```txt
Service
 └─ cria resposta

AnswerCreatedEvent
 ├─ cria notificação
 ├─ envia email
 └─ atualiza métricas
```

O caso de uso fica desacoplado das ações secundárias.
