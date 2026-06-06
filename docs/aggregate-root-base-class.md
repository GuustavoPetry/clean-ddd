# Classe Base AggregateRoot

## Introdução

Em uma implementação de Domain-Driven Design (DDD), muitas entidades do sistema possuem comportamentos diferentes.

Algumas representam apenas entidades comuns do domínio, enquanto outras representam a entidade principal de um Aggregate.

Para deixar essa distinção explícita no código, normalmente é criada uma classe base chamada:

```typescript
AggregateRoot
```

Inicialmente essa classe pode não possuir nenhuma lógica específica. Seu primeiro objetivo é apenas representar conceitualmente que determinada entidade é a raiz de um agregado.

---

# Estrutura Inicial

## Criando a classe

Localização:

```text
core/
└── entities/
    ├── entity.ts
    └── aggregate-root.ts
```

Arquivo:

```typescript
export abstract class AggregateRoot<Props> extends Entity<Props> {}
```

Nesse primeiro momento ela não possui atributos nem métodos.

Mesmo assim ela já possui um papel importante dentro da modelagem do domínio.

---

# Por que criar uma classe vazia?

À primeira vista pode parecer estranho criar uma classe sem nenhuma implementação.

Exemplo:

```typescript
export abstract class AggregateRoot<Props>
  extends Entity<Props> {}
```

"Por que não utilizar Entity diretamente?"

A resposta é:

**Porque o código está comunicando uma regra do domínio.**

Quando um desenvolvedor encontra:

```typescript
class Question extends Entity<QuestionProps>
```

ele entende que Question é apenas uma entidade.

Mas ao encontrar:

```typescript
class Question extends AggregateRoot<QuestionProps>
```

fica claro que:

- Question é a raiz de um agregado;
- outras entidades dependem dela;
- ela é responsável por manter a consistência do agregado;
- alterações devem passar por ela.

Essa distinção tem enorme valor semântico.

---

# AggregateRoot herda de Entity

A AggregateRoot continua sendo uma entidade.

Por isso ela estende a classe base Entity.

```typescript
export abstract class AggregateRoot<Props>
  extends Entity<Props> {}
```

Hierarquia:

```text
Entity
  │
  └── AggregateRoot
          │
          ├── Question
          ├── Order
          ├── Invoice
          └── Customer
```

Toda Aggregate Root é uma Entity.

Mas nem toda Entity é uma Aggregate Root.

---

# Recebendo Props

Assim como Entity, AggregateRoot recebe as propriedades da entidade.

Exemplo simplificado:

```typescript
export abstract class AggregateRoot<Props>
  extends Entity<Props> {

  constructor(props: Props, id?: UniqueEntityID) {
    super(props, id)
  }
}
```

Nesse caso ela apenas repassa os parâmetros para a Entity.

```typescript
super(props, id)
```

Ou seja:

- AggregateRoot não cria comportamento novo;
- apenas reaproveita tudo que Entity já possui.

---

# Classe abstrata

A AggregateRoot normalmente é declarada como abstrata.

```typescript
export abstract class AggregateRoot<Props>
  extends Entity<Props> {}
```

Isso impede que alguém faça:

```typescript
const aggregate = new AggregateRoot(...)
```

O que não faria sentido.

A classe existe apenas para servir de base para agregados concretos.

Exemplos válidos:

```typescript
class Question extends AggregateRoot<QuestionProps> {}

class Order extends AggregateRoot<OrderProps> {}
```

---

# O significado de Aggregate Root

No DDD existe o conceito de Aggregate.

Um Aggregate é um conjunto de objetos que devem ser tratados como uma única unidade de consistência.

Exemplo:

```text
Question
│
├── Attachment
├── Attachment
└── Attachment
```

Nesse caso:

```text
Question
```

é a Aggregate Root.

Os anexos fazem parte do agregado.

---

# Responsabilidade da Root

A Root é a porta de entrada para o agregado.

Toda alteração deve passar por ela.

Exemplo:

```typescript
question.addAttachment(attachment)

question.removeAttachment(attachmentId)
```

Ao invés de:

```typescript
attachment.update(...)
```

diretamente.

Isso garante que as regras do domínio sejam respeitadas.

---

# Aggregate não é apenas relacionamento

Um erro comum é pensar que Aggregate é apenas um relacionamento entre entidades.

Por exemplo:

```text
Question → Attachment
```

Nem todo relacionamento forma um Aggregate.

A característica principal de um Aggregate é a dependência de consistência.

---

## Relacionamento comum

Imagine:

```text
User
└── Address
```

Talvez o endereço possa existir independentemente.

Talvez possua seu próprio ciclo de vida.

Nesse caso pode não ser um Aggregate.

---

## Aggregate

Agora imagine:

```text
Question
└── QuestionAttachment
```

Um anexo sem pergunta não possui significado dentro do domínio.

Ele depende da existência da pergunta.

Quando a pergunta é manipulada, os anexos também precisam ser considerados.

Nesse cenário existe um Aggregate.

---

# Persistência do Aggregate

Uma das características mais importantes:

O Aggregate é salvo através da Aggregate Root.

Exemplo:

```typescript
await questionRepository.save(question)
```

O repositório da pergunta será responsável por:

- salvar a pergunta;
- criar anexos novos;
- remover anexos excluídos;
- atualizar relacionamentos.

Tudo a partir da Root.

Não existe:

```typescript
attachmentRepository.save(...)
```

sendo chamado diretamente pela camada de aplicação.

---

# Benefício de criar AggregateRoot desde o início

Mesmo vazia, a classe traz vantagens importantes.

## Comunicação

Mostra claramente quais entidades são raízes de agregados.

```typescript
class Question extends AggregateRoot<QuestionProps>
```

é muito mais expressivo do que:

```typescript
class Question extends Entity<QuestionProps>
```

---

## Padronização

Todos os agregados seguem a mesma estrutura.

```typescript
Question
Order
Invoice
Customer
```

Todos herdam de:

```typescript
AggregateRoot
```

---

## Evolução futura

Mais tarde a classe pode ganhar comportamentos específicos dos agregados.

Por exemplo:

```typescript
addDomainEvent(event)

clearEvents()

dispatchEvents()
```

ou

```typescript
getDomainEvents()
```

Essas funcionalidades geralmente são adicionadas quando se começa a trabalhar com Domain Events.

Como todos os agregados já herdam de AggregateRoot, a evolução acontece de forma simples e centralizada.

---

# Resumo

A classe AggregateRoot inicialmente pode ser completamente vazia, mas possui um papel fundamental na modelagem do domínio.

Ela existe para representar explicitamente que determinada entidade é a raiz de um Aggregate.

Principais características:

- Estende a classe Entity.
- É uma classe abstrata.
- Recebe Props e repassa para Entity.
- Inicialmente não possui comportamento próprio.
- Serve para comunicar intenções do domínio.
- Identifica a entidade principal de um Aggregate.
- Garante que alterações sejam feitas através da Root.
- Facilita futuras implementações de Domain Events e outras funcionalidades específicas de agregados.

Exemplo final:

```typescript
export abstract class AggregateRoot<Props>
  extends Entity<Props> {}
```

Mesmo sem uma única linha de lógica adicional, essa classe já adiciona significado arquitetural importante ao sistema.