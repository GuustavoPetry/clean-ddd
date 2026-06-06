# Entidades de Anexo e Relacionamentos de Aggregate no DDD

## Introdução

Durante a modelagem do domínio, surge uma situação bastante comum:

```text
Question
└── Attachments

Answer
└── Attachments
```

Tanto perguntas quanto respostas podem possuir anexos.

A primeira ideia que muitos desenvolvedores têm é criar uma única entidade de relacionamento genérica utilizando polimorfismo:

```text
Attachment
└── ownerId
└── ownerType
```

ou

```text
Attachment
├── Question
└── Answer
```

Porém, em DDD nem sempre a solução mais genérica é a melhor solução.

Nesta abordagem, o objetivo é modelar explicitamente o domínio, separando os relacionamentos de Question e Answer em entidades próprias.

---

# O Problema

Imagine que exista um anexo:

```text
Documento.pdf
```

Esse anexo pode ser utilizado por:

- uma pergunta
- uma resposta

O anexo em si é apenas um recurso do sistema.

O que muda é o contexto em que ele está sendo utilizado.

Por isso, devemos separar:

```text
Attachment
```

de

```text
QuestionAttachment
```

e

```text
AnswerAttachment
```

---

# Entidade Base Attachment

## Objetivo

Representar o anexo em si.

Ela contém apenas informações relacionadas ao arquivo.

Exemplo:

```text
Título
Link
```

Não deve saber nada sobre:

- perguntas
- respostas
- agregados

Sua única responsabilidade é representar um anexo.

---

# Criando AttachmentProps

Primeiro definimos os dados que um anexo possui.

```typescript
interface AttachmentProps {
  title: string
  link: string
}
```

Exemplo:

```typescript
{
  title: "Diagrama UML",
  link: "https://..."
}
```

Essas propriedades representam o estado da entidade.

---

# Herdando de Entity

A entidade Attachment herda da classe base Entity.

```typescript
export class Attachment extends Entity<AttachmentProps> {}
```

Agora Attachment passa a possuir:

- id
- regras de comparação
- identidade única

herdadas da classe Entity.

---

# Getters

Como as propriedades ficam protegidas dentro da entidade, expomos apenas leitura através de getters.

```typescript
get title() {
  return this.props.title
}
```

```typescript
get link() {
  return this.props.link
}
```

Uso:

```typescript
attachment.title
```

ao invés de:

```typescript
attachment.props.title
```

---

# Método Create

Uma prática comum em DDD é impedir a criação direta usando `new`.

Ao invés disso utilizamos um método de fábrica.

```typescript
static create(
  props: AttachmentProps,
  id?: UniqueEntityID,
) {
  return new Attachment(props, id)
}
```

Uso:

```typescript
const attachment = Attachment.create({
  title: "Documento",
  link: "https://..."
})
```

Benefícios:

- centraliza validações futuras;
- mantém consistência da criação;
- esconde detalhes da implementação.

---

# Por que não colocar QuestionId dentro de Attachment?

Muitos sistemas fariam algo parecido com:

```typescript
interface AttachmentProps {
  title: string
  link: string
  questionId?: string
}
```

ou

```typescript
interface AttachmentProps {
  title: string
  link: string
  answerId?: string
}
```

Isso cria um acoplamento desnecessário.

Agora o Attachment passa a conhecer Question e Answer.

Isso viola o princípio de responsabilidade única.

---

# Separando o Relacionamento

Ao invés disso criamos entidades específicas de relacionamento.

```text
QuestionAttachment
```

e

```text
AnswerAttachment
```

---

# QuestionAttachment

## Objetivo

Representar que um anexo pertence a uma pergunta.

Não representa o arquivo.

Representa apenas a associação.

---

## Estrutura

```typescript
interface QuestionAttachmentProps {
  questionId: UniqueEntityID
  attachmentId: UniqueEntityID
}
```

Visualmente:

```text
Question
   │
   ▼
QuestionAttachment
   │
   ▼
Attachment
```

---

## Herdando de Entity

```typescript
export class QuestionAttachment
  extends Entity<QuestionAttachmentProps> {}
```

Essa entidade possui identidade própria.

---

## Getters

```typescript
get questionId() {
  return this.props.questionId
}
```

```typescript
get attachmentId() {
  return this.props.attachmentId
}
```

Uso:

```typescript
questionAttachment.questionId
```

```typescript
questionAttachment.attachmentId
```

---

## Método Create

```typescript
static create(
  props: QuestionAttachmentProps,
  id?: UniqueEntityID,
) {
  return new QuestionAttachment(props, id)
}
```

Uso:

```typescript
QuestionAttachment.create({
  questionId,
  attachmentId,
})
```

O resultado é:

```text
Pergunta X
  ↕
Anexo Y
```

---

# AnswerAttachment

A mesma ideia é aplicada para respostas.

---

## Props

```typescript
interface AnswerAttachmentProps {
  answerId: UniqueEntityID
  attachmentId: UniqueEntityID
}
```

---

## Classe

```typescript
export class AnswerAttachment
  extends Entity<AnswerAttachmentProps> {}
```

---

## Getters

```typescript
get answerId() {
  return this.props.answerId
}
```

```typescript
get attachmentId() {
  return this.props.attachmentId
}
```

---

## Método Create

```typescript
static create(
  props: AnswerAttachmentProps,
  id?: UniqueEntityID,
) {
  return new AnswerAttachment(props, id)
}
```

Uso:

```typescript
AnswerAttachment.create({
  answerId,
  attachmentId,
})
```

---

# Por que não usar Polimorfismo?

Uma abordagem comum seria:

```typescript
interface AttachmentReferenceProps {
  attachmentId: string
  ownerId: string
  ownerType: "question" | "answer"
}
```

ou

```typescript
class AttachmentReference {}
```

que serviria para qualquer entidade.

Embora pareça mais simples, ela possui problemas.

---

## Problema 1: Perda de significado

Observe:

```typescript
AttachmentReference
```

O nome não informa claramente o que está acontecendo.

Agora compare com:

```typescript
QuestionAttachment
```

ou

```typescript
AnswerAttachment
```

O domínio fica muito mais explícito.

---

## Problema 2: Regras diferentes

Hoje o relacionamento é simples.

Mas amanhã pode existir uma regra:

```text
QuestionAttachment:
- máximo 10 anexos
```

e

```text
AnswerAttachment:
- máximo 3 anexos
```

Com entidades separadas, isso é fácil de implementar.

---

## Problema 3: Crescimento do domínio

Imagine que futuramente existam:

```text
CommentAttachment
PostAttachment
ArticleAttachment
```

Cada relacionamento pode possuir comportamentos específicos.

O domínio continua organizado.

---

# Relação com Aggregate

A entidade Attachment não pertence diretamente ao Aggregate.

O Aggregate é composto pelas entidades de relacionamento.

Exemplo:

```text
Question (Aggregate Root)
│
├── QuestionAttachment
├── QuestionAttachment
└── QuestionAttachment
```

e

```text
Answer (Aggregate Root)
│
├── AnswerAttachment
├── AnswerAttachment
└── AnswerAttachment
```

Isso é importante porque o Aggregate controla os relacionamentos, não necessariamente os arquivos físicos.

---

# Benefícios dessa abordagem

## Baixo acoplamento

Attachment não conhece Question nem Answer.

---

## Maior clareza

Cada relacionamento possui um nome explícito.

```text
QuestionAttachment
AnswerAttachment
```

---

## Melhor modelagem do domínio

As entidades refletem exatamente os conceitos do negócio.

---

## Facilidade de evolução

Novas regras podem ser adicionadas sem impactar outros relacionamentos.

---

# Resumo

A modelagem separa o conceito de:

```text
Arquivo
```

de

```text
Relacionamento com o arquivo
```

Estrutura final:

```text
Attachment
│
├── title
└── link
```

```text
QuestionAttachment
│
├── questionId
└── attachmentId
```

```text
AnswerAttachment
│
├── answerId
└── attachmentId
```

Dessa forma o domínio permanece explícito, desacoplado e alinhado com os princípios do DDD, evitando abstrações genéricas e polimorfismos desnecessários que escondem o significado real dos relacionamentos.