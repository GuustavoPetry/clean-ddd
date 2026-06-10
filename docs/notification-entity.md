# Anatomia de uma Entidade no DDD

## Introdução

Uma das estruturas mais importantes dentro do Domain-Driven Design é a **Entidade (Entity)**.

Uma entidade representa algo que possui uma identidade própria dentro do domínio.

Diferente de um Value Object, uma entidade continua sendo a mesma mesmo que seus atributos mudem.

Exemplo:

```text
Notificação #1
```

Se o título mudar:

```text
"Nova resposta"

↓

"Você recebeu uma resposta"
```

continua sendo a mesma notificação.

O que a identifica não é o título, mas sim seu ID.

---

# Exemplo da Entidade Notification

Estrutura criada na aula:

```text
notification
└── enterprise
    └── entities
        └── notification.ts
```

---

# 1. Criar o Subdomínio Notification

Antes de criar a entidade, foi criado um novo subdomínio:

```text
Notification
```

---

## Por que criar um subdomínio?

No DDD tentamos organizar o sistema de acordo com o negócio.

Exemplo da estrutura atual do projeto:

```text
forum
├── question
├── answer
└── attachment
```

Agora adicionamos:

```text
notification
```

ficando:

```text
domain
├── forum
└── notification
```

---

## O que pertence ao domínio Notification?

Tudo relacionado a notificações:

```text
Criar notificação
Marcar como lida
Listar notificações
Buscar notificações
```

---

# 2. Criar a Entidade Notification

Arquivo:

```text
notification.ts
```

---

## Responsabilidade

Representar uma notificação do sistema.

Exemplo:

```text
Gustavo recebeu uma resposta
```

ou

```text
Sua pergunta recebeu um comentário
```

---

# Estrutura Geral

```typescript
export class Notification extends Entity<NotificationProps> {
}
```

---

## Por que herdar de Entity?

Porque Notification possui identidade própria.

Exemplo:

```typescript
notification.id
```

Mesmo que o conteúdo mude:

```typescript
notification.content
```

a entidade continua sendo a mesma.

---

# 3. NotificationProps

As propriedades da entidade ficam agrupadas em uma interface.

---

## Implementação

```typescript
interface NotificationProps {
  recipientId: UniqueEntityID
  title: string
  content: string
  createdAt: Date
  readAt?: Date | null
}
```

---

## Por que usar Props?

Ao invés de criar:

```typescript
class Notification {
  recipientId
  title
  content
}
```

agrupamos tudo em uma estrutura única.

Isso melhora:

- organização;
- tipagem;
- manutenção;
- reaproveitamento.

---

# recipientId

```typescript
recipientId: UniqueEntityID
```

Representa quem irá receber a notificação.

---

## Exemplo

```text
Usuário: Gustavo
```

ID:

```typescript
recipientId = "user-123"
```

---

## Exemplo real

```text
Pergunta recebeu resposta
        │
        ▼
Criar notificação
        │
        ▼
recipientId = autor da pergunta
```

---

# title

```typescript
title: string
```

Título resumido da notificação.

---

## Exemplo

```text
Nova resposta recebida
```

ou

```text
Sua pergunta foi respondida
```

---

# content

```typescript
content: string
```

Mensagem completa da notificação.

---

## Exemplo

```text
João respondeu sua pergunta sobre DDD.
```

---

# createdAt

```typescript
createdAt: Date
```

Data de criação.

---

## Exemplo

```typescript
2026-06-10T15:30:00
```

Serve para:

- ordenação;
- histórico;
- auditoria.

---

# readAt

```typescript
readAt?: Date | null
```

Data em que a notificação foi lida.

---

## Quando criada

```typescript
readAt = null
```

ou

```typescript
undefined
```

---

## Após leitura

```typescript
readAt = new Date()
```

---

## Exemplo

Antes:

```text
🔴 Não lida
```

Depois:

```text
✔ Lida
```

---

# 4. Criar Getters

Após definir as propriedades, criamos os getters.

---

## O que é um Getter?

É uma forma controlada de acessar propriedades.

Ao invés de:

```typescript
notification.props.title
```

utilizamos:

```typescript
notification.title
```

---

# Getter recipientId

```typescript
get recipientId() {
  return this.props.recipientId
}
```

Uso:

```typescript
notification.recipientId
```

---

# Getter title

```typescript
get title() {
  return this.props.title
}
```

Uso:

```typescript
notification.title
```

---

# Getter content

```typescript
get content() {
  return this.props.content
}
```

Uso:

```typescript
notification.content
```

---

# Getter createdAt

```typescript
get createdAt() {
  return this.props.createdAt
}
```

Uso:

```typescript
notification.createdAt
```

---

# Getter readAt

```typescript
get readAt() {
  return this.props.readAt
}
```

Uso:

```typescript
notification.readAt
```

---

# Por que não acessar props diretamente?

Errado:

```typescript
notification.props.title
```

Correto:

```typescript
notification.title
```

Benefícios:

- encapsulamento;
- menor acoplamento;
- possibilidade de adicionar regras futuras.

---

# 5. Método Static Create

Quase todas as entidades do projeto seguem esse padrão.

---

## Estrutura

```typescript
static create(
  props,
  id?
) {
  return new Notification(...)
}
```

---

## Por que usar create()?

Ao invés de:

```typescript
new Notification(...)
```

utilizamos:

```typescript
Notification.create(...)
```

---

Benefícios:

- centraliza regras de criação;
- facilita manutenção;
- facilita validações futuras;
- padroniza o domínio.

---

# Optional Props

Na aula foi utilizado:

```typescript
Optional<
  NotificationProps,
  'createdAt'
>
```

---

## O que isso significa?

Que:

```typescript
createdAt
```

é opcional durante a criação.

---

### Exemplo

Sem Optional:

```typescript
Notification.create({
  recipientId,
  title,
  content,
  createdAt
})
```

obrigatório.

---

Com Optional:

```typescript
Notification.create({
  recipientId,
  title,
  content
})
```

funciona normalmente.

---

# Definindo Valor Padrão

Dentro do create:

```typescript
createdAt:
  props.createdAt ??
  new Date()
```

---

Se o valor não for informado:

```typescript
new Date()
```

será utilizado.

---

## Exemplo

```typescript
const notification =
  Notification.create({
    recipientId,
    title,
    content
  })
```

Resultado:

```typescript
createdAt = agora
```

---

# Recebendo ID Opcional

O create também recebe:

```typescript
id?: UniqueEntityID
```

---

## Quando isso é usado?

### Criando uma nova entidade

```typescript
Notification.create({
  ...
})
```

ID será criado automaticamente.

---

### Reconstituindo do banco

```typescript
Notification.create(
  {
    ...
  },
  new UniqueEntityID("123")
)
```

Mantém o ID existente.

---

# Retornando a Instância

Ao final:

```typescript
return new Notification(
  {
    ...
  },
  id
)
```

---

Resultado:

```typescript
const notification =
  Notification.create(...)
```

Agora temos uma entidade válida do domínio.

---

# Exemplo Completo

```typescript
const notification =
  Notification.create({
    recipientId: new UniqueEntityID("user-1"),
    title: "Nova resposta",
    content: "João respondeu sua pergunta."
  })
```

---

Estado da entidade:

```typescript
{
  id: "notification-1",
  recipientId: "user-1",
  title: "Nova resposta",
  content: "João respondeu sua pergunta.",
  createdAt: "2026-06-10",
  readAt: null
}
```

---

# Fluxo Visual

```text
Notification.create()
          │
          ▼
Recebe Props
          │
          ▼
Define valores padrão
(createdAt)
          │
          ▼
Cria instância
          │
          ▼
Retorna Notification
```

---

# Resumo

Uma entidade no DDD normalmente é composta por:

| Elemento | Responsabilidade |
|-----------|-----------|
| Entity | Fornece identidade |
| Props | Agrupa propriedades |
| Getters | Exposição controlada dos dados |
| create() | Padroniza criação |
| Optional | Permite valores opcionais |
| ID opcional | Reconstituição do banco |
| Defaults | Define valores automáticos |

No caso da entidade **Notification**, ela representa uma notificação enviada para um usuário, contendo:

```text
recipientId -> quem recebe
title       -> título
content     -> mensagem
createdAt   -> data de criação
readAt      -> data de leitura
```

seguindo exatamente o mesmo padrão arquitetural utilizado nas entidades **Question**, **Answer** e **Attachment** ao longo do projeto.