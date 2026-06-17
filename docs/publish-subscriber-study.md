# Classe DomainEvents:

# Props
- handlersMap: Record<string, DomainEventCallback[]>
- markedAggregates: AggregateRoot<any>[]
- obs: type DomainEventCallback = (event: DomainEvent) => void

# Métodos
- markAggregateForDispatch: 
1. recebe um AggregateRoot como parâmetro
2. executa metódo que buscar o aggregate na lista markedAggregates pelo ID (transformando em Boolean)
3. se o resultado for 'false' adiciona o aggregate na lista markedAggregates

- dispatchAggregateEvents:
1. recebe AggregateRoot como parâmetro
2. percorre todos os itens da propriedade domainEvents do aggregate
3. executa a função 'dispatch' em cada item da lista

- removeAggregateFromMarkedDispatchList:
1. recebe AggregateRoot como parâmetro
2. busca o indice do item na lista markedAggregates que seja igual ao aggregate do parâmetro
3. remove o indice encontrado da lista

- findMarkedAggregateByID:
1. recebe um UniqueEntityID como parâmetro
2. busca na lista markedAggregates o aggregate que tem o mesmo ID do parâmetro

- dispatchEventsForAggregate:
1. recebe um UniqueEntityID como parâmetro
2. executa o método 'findMarkedAggregateByID' passando o ID do parâmetro
3. verifica se encontrou um aggregate
4. executa 'dispatchAggregateEvents' passando o aggregate encontrado
5. executa o método 'clearEvents' do aggregate
6. executa 'removeAggregateFromMarkedDispatchList'

- register:
1. recebe um DomainEventCallback, e um eventClassName como parâmetro
2. cria constante booleana que verifica se o eventClassName existe em 'handlersMap'
3. se a constante for falsa, atribui [] a handlerMap na chave eventClassName
4. adiciona DomainEventCallback a handlerMap na chave eventClassName

- clearHandlers:
1. atribui {} a handlersMap

- clearMarkedAggregates:
1. atribui [] a markedAggregates

- dispatch:
1. recebe DomainEvent como parâmetro
2. cria constante para guardar o nome da classe do evento do parâmetro
3. cria constante booleana que verifica se o nome da classe está em handlersMap
4. se estiver no handlersMap percorre e executa todos os callbacks de handlersMap na chave nome da classe

# Interface DomainEvent
- recebe ocurredAt, getAggregateId()
- obs: implementado nas classes que representam o evento

# Interface EventHandler
- recebe setupSubscriptions(): void
- implementado nas classes que representam o subscriber

# Funcionamento Geral
1. todos os subscribers são inicializados para escutar eventos 
2. quando ocorre alteração relevante no domínio, é chamado addDomainEvent do aggregate, que chama 'markAggregateForDispatch'
3. quando o banco de dados executa ação é chamado 'dispatchEventsForAggregate' que executa o restante das ações

___________________________________________________________________________________________________________________________

# Domain Events e Pub/Sub

## Objetivo

Permitir que ações importantes do domínio gerem eventos que podem ser processados por múltiplos subscribers sem acoplamento direto entre as partes da aplicação.

---

# Classe DomainEvents

Responsável por registrar subscribers, armazenar aggregates com eventos pendentes e disparar eventos.

## Propriedades

```ts
private static handlersMap: Record<string, DomainEventCallback[]> = {};

private static markedAggregates: AggregateRoot<any>[] = [];
```

### handlersMap

Armazena os callbacks registrados para cada tipo de evento.

Exemplo:

```ts
{
  AnswerCreatedEvent: [
    callback1,
    callback2,
  ]
}
```

### markedAggregates

Lista de Aggregates que possuem eventos aguardando dispatch.

---

## markAggregateForDispatch()

Marca um Aggregate para ter seus eventos disparados posteriormente.

### Fluxo

1. Recebe um Aggregate.
2. Verifica se ele já está na lista `markedAggregates`.
3. Caso não esteja, adiciona à lista.

Exemplo:

```ts
DomainEvents.markAggregateForDispatch(answer);
```

---

## dispatchAggregateEvents()

Dispara todos os eventos de um Aggregate.

### Fluxo

1. Recebe um Aggregate.
2. Percorre `aggregate.domainEvents`.
3. Executa `dispatch(event)` para cada evento.

Exemplo:

```ts
aggregate.domainEvents.forEach((event) => {
  DomainEvents.dispatch(event);
});
```

---

## removeAggregateFromMarkedDispatchList()

Remove o Aggregate da lista de marcados após o processamento dos eventos.

---

## findMarkedAggregateByID()

Busca um Aggregate pelo ID dentro de `markedAggregates`.

Exemplo:

```ts
const aggregate =
  DomainEvents.findMarkedAggregateByID(answer.id);
```

---

## dispatchEventsForAggregate()

Método principal utilizado pelos repositórios após persistir um Aggregate.

### Fluxo

1. Busca o Aggregate pelo ID.
2. Dispara seus eventos.
3. Limpa os eventos.
4. Remove o Aggregate da lista de marcados.

Exemplo:

```ts
DomainEvents.dispatchEventsForAggregate(answer.id);
```

---

## register()

Registra um callback para um tipo de evento.

### Fluxo

1. Recebe um callback.
2. Recebe o nome da classe do evento.
3. Cria a entrada em `handlersMap` caso não exista.
4. Adiciona o callback à lista.

Exemplo:

```ts
DomainEvents.register(
  this.sendNotification.bind(this),
  AnswerCreatedEvent.name,
);
```

---

## dispatch()

Executa os subscribers registrados para determinado evento.

### Fluxo

1. Recebe um DomainEvent.
2. Obtém o nome da classe do evento.
3. Busca os callbacks registrados.
4. Executa cada callback.

Exemplo:

```ts
const eventClassName = event.constructor.name;

handlers.forEach((handler) => {
  handler(event);
});
```

---

# Interface DomainEvent

Representa um evento de domínio.

```ts
export interface DomainEvent {
  ocurredAt: Date;
  getAggregateId(): UniqueEntityID;
}
```

Exemplo:

```ts
export class AnswerCreatedEvent
  implements DomainEvent {

  ocurredAt: Date;

  constructor(
    public answer: Answer,
  ) {
    this.ocurredAt = new Date();
  }

  getAggregateId() {
    return this.answer.id;
  }
}
```

---

# Interface EventHandler

Representa um subscriber.

```ts
export interface EventHandler {
  setupSubscriptions(): void;
}
```

Exemplo:

```ts
export class OnAnswerCreated
  implements EventHandler {

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNotification.bind(this),
      AnswerCreatedEvent.name,
    );
  }
}
```

---

# Fluxo Completo

## 1. Subscriber é inicializado

```ts
new OnAnswerCreated();
```

```ts
setupSubscriptions() {
  DomainEvents.register(
    this.sendNotification.bind(this),
    AnswerCreatedEvent.name,
  );
}
```

---

## 2. Aggregate gera um evento

```ts
answer.addDomainEvent(
  new AnswerCreatedEvent(answer),
);
```

O Aggregate é marcado para dispatch.

---

## 3. Repositório salva o Aggregate

```ts
await answerRepository.create(answer);
```

---

## 4. Após salvar, os eventos são disparados

```ts
DomainEvents.dispatchEventsForAggregate(
  answer.id,
);
```

---

## 5. DomainEvents encontra os subscribers

```ts
const eventClassName =
  event.constructor.name;
```

Resultado:

```ts
"AnswerCreatedEvent"
```

---

## 6. Subscribers são executados

```ts
handler(event);
```

Exemplo:

```ts
private sendNotification(
  event: AnswerCreatedEvent,
) {
  console.log('Resposta criada!');
}
```

---

# Resumo

```text
Subscriber inicia
        ↓
register()
        ↓
Aggregate gera evento
        ↓
addDomainEvent()
        ↓
markAggregateForDispatch()
        ↓
Repository salva Aggregate
        ↓
dispatchEventsForAggregate()
        ↓
dispatch()
        ↓
Subscribers executados
```


