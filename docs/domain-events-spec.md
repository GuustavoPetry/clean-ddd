# Criando um Domain Event para um Aggregate

Objetivo: disparar automaticamente um evento de domínio sempre que um Aggregate for criado.

---

# CustomAggregate

Representa um Aggregate Root da aplicação.

Ao ser criado, deve registrar um evento de domínio.

```ts
export class CustomAggregate extends AggregateRoot<Props> {
  static create(props: Props) {
    const aggregate = new CustomAggregate(props)

    aggregate.addDomainEvent(
      new CustomAggregateCreated(aggregate),
    )

    return aggregate
  }
}
```

Fluxo:

```text
CustomAggregate.create()
          ↓
addDomainEvent()
          ↓
Evento registrado
```

---

# Evento de Criação

Criar uma classe responsável por representar o evento.

```ts
export class CustomAggregateCreated
  implements DomainEvent
{
  public ocurredAt: Date

  constructor(
    private aggregate: CustomAggregate,
  ) {
    this.ocurredAt = new Date()
  }

  getAggregateId() {
    return this.aggregate.id
  }
}
```

Responsabilidades:

* Identificar que o Aggregate foi criado.
* Armazenar a data do evento.
* Informar qual Aggregate originou o evento.

---

# Registrando o Evento

Dentro do Aggregate:

```ts
aggregate.addDomainEvent(
  new CustomAggregateCreated(aggregate),
)
```

Resultado:

```text
Aggregate criado
        ↓
Evento criado
        ↓
_domainEvents.push()
        ↓
Pronto para dispatch
```

---

# Estrutura do Evento

Exemplo após a criação:

```ts
[
  {
    aggregate: CustomAggregate,
    ocurredAt: new Date(),
  },
]
```

O evento fica armazenado em:

```ts
aggregate.domainEvents
```

---

# Teste

Validar que o evento foi registrado.

```ts
it('should create a domain event', () => {
  const aggregate = CustomAggregate.create({})

  expect(
    aggregate.domainEvents.length,
  ).toEqual(1)

  expect(
    aggregate.domainEvents[0],
  ).toBeInstanceOf(
    CustomAggregateCreated,
  )
})
```

Também é possível validar o Aggregate associado:

```ts
const event =
  aggregate.domainEvents[0]

expect(
  event.getAggregateId(),
).toEqual(aggregate.id)
```

---

# Resumo

```text
CustomAggregate.create()
          ↓
new CustomAggregateCreated()
          ↓
addDomainEvent()
          ↓
_domainEvents
          ↓
Aggregate marcado para dispatch
          ↓
Repository poderá disparar o evento
```

Esse padrão permite que Aggregates publiquem eventos importantes do domínio sem depender diretamente dos serviços que irão reagir a eles.
