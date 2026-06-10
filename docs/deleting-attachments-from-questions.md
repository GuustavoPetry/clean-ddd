# Deletando os Anexos ao Excluir uma Question

## Introdução

Nesta aula foi implementada uma regra importante do domínio:

> Quando uma pergunta for removida, todos os relacionamentos de anexos pertencentes a ela também devem ser removidos.

Essa implementação reforça um dos conceitos mais importantes de DDD:

```text
Question é a Aggregate Root
```

e

```text
QuestionAttachment pertence ao Aggregate
```

Portanto, quando a Aggregate Root deixa de existir, seus objetos internos também devem ser removidos.

---

# O Problema

Imagine a seguinte estrutura:

```text
Question
│
├── Attachment A
├── Attachment B
└── Attachment C
```

Se a pergunta for excluída:

```typescript
await questionsRepository.delete(question)
```

e os relacionamentos permanecerem armazenados:

```text
QuestionAttachment A
QuestionAttachment B
QuestionAttachment C
```

teremos dados órfãos.

---

## Situação incorreta

```text
Question
❌ removida

QuestionAttachment
✔ continua existindo
```

Isso gera inconsistência no domínio.

---

## Situação correta

```text
Question
❌ removida

QuestionAttachment
❌ removido
```

Todos os relacionamentos devem desaparecer junto com a pergunta.

---

# Passo 1 - Ajustando o Teste

Arquivo:

```text
delete-question.spec.ts
```

Antes o teste validava apenas:

```typescript
expect(inMemoryQuestions.items).toHaveLength(0)
```

Ou seja:

```text
A pergunta foi removida.
```

---

Agora também precisamos garantir:

```text
Os anexos foram removidos.
```

---

## Cenário

Estado inicial:

```text
Questions
 └── Question 1

QuestionAttachments
 ├── Attachment A
 └── Attachment B
```

Após executar:

```typescript
await sut.execute(...)
```

Esperamos:

```text
Questions
 []
```

e

```text
QuestionAttachments
 []
```

---

## Exemplo de validação

```typescript
expect(
  inMemoryQuestions.items
).toHaveLength(0)

expect(
  inMemoryQuestionAttachments.items
).toHaveLength(0)
```

---

# Passo 2 - Injeção de Dependência

## Problema

O repositório de perguntas precisa remover também os anexos.

Mas ele não possui acesso ao repositório de anexos.

Antes:

```typescript
export class InMemoryQuestionsRepository {
}
```

---

Agora precisamos receber essa dependência.

```typescript
export class InMemoryQuestionsRepository {
  constructor(
    private questionAttachmentsRepository:
      InMemoryQuestionAttachmentsRepository
  ) {}
}
```

---

## O que é Inversão de Dependência?

Ao invés de criar o repositório internamente:

```typescript
const repo =
  new InMemoryQuestionAttachmentsRepository()
```

recebemos ele de fora.

```typescript
constructor(
  repo: QuestionAttachmentsRepository
)
```

Isso reduz acoplamento.

---

### Forma errada

```typescript
class QuestionsRepository {
  private attachmentsRepository =
    new AttachmentsRepository()
}
```

O repositório passa a depender diretamente da implementação concreta.

---

### Forma correta

```typescript
class QuestionsRepository {
  constructor(
    attachmentsRepository
  ) {}
}
```

Agora a dependência é injetada externamente.

---

# Passo 3 - Criando deleteManyByQuestionId

Precisamos de uma forma de remover todos os relacionamentos de uma pergunta.

Criamos então:

```typescript
deleteManyByQuestionId(
  questionId: string
)
```

---

## Objetivo

Receber:

```typescript
questionId
```

e remover todos os registros vinculados.

---

## Exemplo

Coleção atual:

```text
Question 1 -> Attachment A
Question 1 -> Attachment B
Question 2 -> Attachment C
```

Executando:

```typescript
deleteManyByQuestionId("Question 1")
```

Resultado esperado:

```text
Question 2 -> Attachment C
```

---

# Passo 4 - Implementando deleteManyByQuestionId

A estratégia utilizada foi simples:

Utilizar:

```typescript
filter()
```

para manter apenas os registros válidos.

---

## Implementação

```typescript
this.items = this.items.filter(
  item =>
    item.questionId.toString() !==
    questionId
)
```

---

## Como funciona?

Supondo:

```typescript
[
  AttachmentA,
  AttachmentB,
  AttachmentC
]
```

onde:

```text
AttachmentA -> Question 1
AttachmentB -> Question 1
AttachmentC -> Question 2
```

---

O filtro mantém apenas:

```typescript
[
  AttachmentC
]
```

pois os demais pertencem à pergunta removida.

---

## Resultado visual

Antes:

```text
Question 1 -> A
Question 1 -> B
Question 2 -> C
```

Depois:

```text
Question 2 -> C
```

---

# Passo 5 - Alterando o delete da Question

Antes o método delete removia apenas a pergunta.

Exemplo:

```typescript
async delete(question: Question) {
  this.items = this.items.filter(
    item => item.id !== question.id
  )
}
```

---

Problema:

```text
Question removida
QuestionAttachments permanecem
```

---

Agora precisamos remover também os relacionamentos.

---

## Nova implementação

```typescript
async delete(question: Question) {

  await this.questionAttachmentsRepository
    .deleteManyByQuestionId(
      question.id.toString()
    )

  this.items = this.items.filter(
    item => !item.id.equals(question.id)
  )
}
```

---

## Fluxo de execução

```text
delete(question)
       │
       ▼
deleteManyByQuestionId()
       │
       ▼
remove attachments
       │
       ▼
remove question
```

---

# Por que o Repository faz isso?

Uma dúvida comum:

> Não deveria ser o Service responsável por remover os anexos?

Neste caso, não.

---

## Motivo

QuestionAttachment faz parte do Aggregate da Question.

Quando persistimos ou removemos um Aggregate, o Repository da Aggregate Root é responsável por coordenar a operação.

Exemplo:

```text
Question
│
├── QuestionAttachment
├── QuestionAttachment
└── QuestionAttachment
```

Quem controla esse Aggregate é:

```typescript
QuestionRepository
```

e não:

```typescript
QuestionAttachmentRepository
```

isoladamente.

---

# Relação com DDD

O comportamento implementado segue a regra:

```text
Aggregate Root controla todo o Aggregate.
```

---

Quando a Root é removida:

```text
Question
```

todos os objetos pertencentes ao Aggregate também devem ser removidos.

---

## Analogia

Imagine um pedido:

```text
Order
│
├── Item 1
├── Item 2
└── Item 3
```

Se o pedido for cancelado:

```text
Order ❌
```

os itens não fazem mais sentido.

Logo:

```text
OrderItem ❌
```

também devem ser removidos.

O mesmo acontece com:

```text
Question
```

e

```text
QuestionAttachment
```

---

# Fluxo Completo da Exclusão

Estado inicial:

```text
Questions
 └── Question 1

Attachments
 ├── A
 ├── B
 └── C
```

Relacionamentos:

```text
Question 1 -> A
Question 1 -> B
Question 1 -> C
```

---

Execução:

```typescript
await questionsRepository.delete(
  question
)
```

---

Internamente:

```typescript
await questionAttachmentsRepository
  .deleteManyByQuestionId(
    question.id.toString()
  )
```

---

Depois:

```typescript
this.items = this.items.filter(...)
```

---

Estado final:

```text
Questions
 []
```

```text
QuestionAttachments
 []
```

---

# Resumo

Nesta implementação foi adicionada a remoção em cascata dos relacionamentos de anexos quando uma pergunta é excluída.

Principais alterações:

* O teste passou a validar a remoção dos anexos.
* Foi criada a dependência do QuestionAttachmentsRepository dentro do QuestionRepository.
* Foi implementado o método `deleteManyByQuestionId`.
* O método utiliza `filter()` para manter apenas os registros que não pertencem à pergunta removida.
* O método `delete()` do repositório de perguntas passou a chamar o repositório de anexos antes de remover a própria pergunta.
* A solução segue os princípios de DDD, onde a Aggregate Root é responsável por todo o ciclo de vida das entidades pertencentes ao Aggregate.

Resultado final:

```text
Delete Question
        │
        ▼
Delete QuestionAttachments
        │
        ▼
Delete Question
```

garantindo consistência e evitando registros órfãos dentro do domínio.
:::
