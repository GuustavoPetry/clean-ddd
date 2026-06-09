# Refatorando Entidades e Services para Utilizar WatchedList

## Introdução

Após implementar e testar o Pattern WatchedList isoladamente, o próximo passo foi integrá-lo ao domínio.

O objetivo dessa refatoração é permitir que a entidade Question consiga rastrear automaticamente:

* anexos adicionados;
* anexos removidos;
* anexos mantidos;

sem que os Services ou Repositories precisem comparar arrays manualmente.

Antes da refatoração, a entidade armazenava:

```typescript
attachments: QuestionAttachment[]
```

Após a refatoração:

```typescript
attachments: QuestionAttachmentList
```

A partir desse momento o próprio Aggregate passa a conhecer as alterações realizadas em sua coleção.

---

# Parte 1 - Utilizando WatchedList nas Entidades

## Criando QuestionAttachmentList

Arquivo:

```text
src/domain/forum/enterprise/entities/question-attachment-list.ts
```

Objetivo:

Especializar a WatchedList para trabalhar especificamente com:

```typescript
QuestionAttachment
```

---

## Herdando de WatchedList

A nova classe estende a classe abstrata criada anteriormente.

```typescript
export class QuestionAttachmentList
  extends WatchedList<QuestionAttachment> {
}
```

Observe que o Generic Type agora é:

```typescript
QuestionAttachment
```

Isso significa que a lista passa a trabalhar apenas com entidades desse tipo.

---

## Implementando compareItems

A WatchedList possui um método abstrato:

```typescript
compareItems(a, b)
```

Como ela é genérica, não sabe como comparar entidades.

A responsabilidade fica para a classe concreta.

---

### Implementação

```typescript
compareItems(
  a: QuestionAttachment,
  b: QuestionAttachment
): boolean {
  return a.attachmentId.equals(b.attachmentId)
}
```

---

### Por que comparar pelo attachmentId?

Imagine:

```text
QuestionAttachment
 ├── questionId
 └── attachmentId
```

O que identifica unicamente o vínculo é o attachment associado.

Se dois objetos possuem o mesmo attachmentId, representam o mesmo relacionamento para a lista.

Exemplo:

```typescript
attachment-1 === attachment-1
```

Resultado:

```typescript
true
```

---

# Alterando a Entidade Question

Antes:

```typescript
attachments: QuestionAttachment[]
```

Depois:

```typescript
attachments: QuestionAttachmentList
```

---

## Benefício

Agora a entidade possui acesso aos métodos:

```typescript
getNewItems()
```

```typescript
getRemovedItems()
```

```typescript
update()
```

```typescript
currentItems()
```

que antes não existiam.

---

## Ajustando o Getter

Antes:

```typescript
get attachments(): QuestionAttachment[]
```

Depois:

```typescript
get attachments(): QuestionAttachmentList
```

---

## Ajustando o Setter

Antes:

```typescript
set attachments(
  attachments: QuestionAttachment[]
)
```

Depois:

```typescript
set attachments(
  attachments: QuestionAttachmentList
)
```

Agora a entidade trabalha exclusivamente com a abstração especializada.

---

## Ajustando o Create

Antes:

```typescript
attachments: props.attachments ?? []
```

Agora:

```typescript
attachments:
  props.attachments ??
  new QuestionAttachmentList([])
```

---

### Por que isso é importante?

Sem essa alteração:

```typescript
question.attachments.update(...)
```

geraria erro.

Arrays normais não possuem os métodos da WatchedList.

Com a inicialização correta:

```typescript
new QuestionAttachmentList([])
```

todos os métodos ficam disponíveis desde a criação da entidade.

---

# Alterando o Service de Criação

## Antes

Os anexos eram criados como array simples.

```typescript
const attachments = attachmentsIds.map(...)
```

Resultado:

```typescript
QuestionAttachment[]
```

---

## Depois

A lista passa a ser encapsulada:

```typescript
const attachments =
  new QuestionAttachmentList(
    attachmentsIds.map(...)
  )
```

---

Resultado:

```typescript
QuestionAttachmentList
```

---

## Benefício

Desde o momento da criação o Aggregate já possui capacidade de rastrear alterações futuras.

---

# Ajustando os Testes

Antes:

```typescript
expect(
  question.attachments
)
```

Depois:

```typescript
expect(
  question.attachments.currentItems()
)
```

---

### Por quê?

Agora attachments não é mais um array.

É uma WatchedList.

O array interno fica encapsulado.

Para acessar os itens atuais devemos utilizar:

```typescript
currentItems()
```

---

# Parte 2 - Editando Propriedades Utilizando WatchedList

## Problema

Durante a edição de uma pergunta precisamos descobrir:

```text
Quais anexos foram removidos?
Quais anexos foram adicionados?
```

Exemplo:

Estado atual:

```text
A
B
C
```

Estado enviado pelo usuário:

```text
A
C
D
```

Resultado esperado:

```text
Adicionar D
Remover B
```

A WatchedList resolve exatamente esse problema.

---

# Criando QuestionAttachmentsRepository

Arquivo:

```text
src/domain/forum/application/repositories/question-attachments-repository.ts
```

---

## Responsabilidade

Buscar os relacionamentos existentes.

Método:

```typescript
findManyByQuestionId(
  questionId: string
): Promise<QuestionAttachment[]>
```

---

### Exemplo

Banco:

```text
Question 1
 ├── A
 ├── B
 └── C
```

Consulta:

```typescript
findManyByQuestionId("question-1")
```

Resultado:

```typescript
[A, B, C]
```

---

# Injetando Repository no Service

Antes:

```typescript
constructor(
  questionsRepository
)
```

Depois:

```typescript
constructor(
  questionsRepository,
  questionAttachmentsRepository
)
```

---

## Motivo

Para atualizar anexos precisamos conhecer os anexos atuais armazenados.

Sem isso não existe comparação possível.

---

# Carregando os Anexos Atuais

Após validar:

```typescript
question
```

e

```typescript
authorId
```

buscamos os relacionamentos existentes.

```typescript
const currentAttachments =
  await questionAttachmentsRepository
    .findManyByQuestionId(question.id.toString())
```

---

Exemplo retornado:

```typescript
[
  attachmentA,
  attachmentB,
  attachmentC
]
```

---

# Criando a WatchedList Atual

Transformamos os dados carregados em uma WatchedList.

```typescript
const attachmentList =
  new QuestionAttachmentList(
    currentAttachments
  )
```

Agora a lista possui:

```text
initial = [A,B,C]
```

---

# Convertendo os Novos IDs

O service recebe:

```typescript
attachmentIds: string[]
```

Exemplo:

```typescript
[
  "A",
  "C",
  "D"
]
```

---

Precisamos transformá-los em:

```typescript
QuestionAttachment[]
```

Utilizando:

```typescript
map()
```

---

Exemplo:

```typescript
const attachments =
  attachmentIds.map(id =>
    QuestionAttachment.create(...)
  )
```

Resultado:

```typescript
[
  A,
  C,
  D
]
```

---

# Atualizando a WatchedList

Agora ocorre a parte mais importante.

```typescript
attachmentList.update(
  attachments
)
```

---

Internamente a WatchedList compara:

```text
Atual:
[A,B,C]

Novo:
[A,C,D]
```

e conclui:

```text
Removed:
[B]

New:
[D]
```

---

## Atualizando a Entidade

Por fim:

```typescript
question.attachments =
  attachmentList
```

O Aggregate agora possui todas as informações necessárias para persistência.

---

# Parte 3 - Implementando o InMemory Repository

## Objetivo

Criar uma implementação fake para os testes.

---

### Estrutura

```typescript
items: QuestionAttachment[]
```

---

### Método

```typescript
findManyByQuestionId(
  questionId: string
)
```

---

## Implementação

Basta filtrar os relacionamentos.

```typescript
return this.items.filter(
  item =>
    item.questionId.toString() ===
    questionId
)
```

---

### Exemplo

Coleção:

```text
Question 1 -> A
Question 1 -> B
Question 2 -> C
```

Consulta:

```typescript
findManyByQuestionId("Question 1")
```

Resultado:

```text
A
B
```

---

# Parte 4 - Testes

## Instanciando o Repository

Agora o Service possui uma nova dependência.

Antes:

```typescript
new EditQuestionService(
  questionsRepository
)
```

Depois:

```typescript
new EditQuestionService(
  questionsRepository,
  questionAttachmentsRepository
)
```

---

# Criando Factory

Foi criada uma factory:

```typescript
makeQuestionAttachment()
```

Objetivo:

Facilitar a criação dos relacionamentos nos testes.

---

# Preparando Cenário

Criamos uma pergunta.

Depois inserimos anexos manualmente:

```typescript
questionAttachmentsRepository.items.push(
  attachment1
)

questionAttachmentsRepository.items.push(
  attachment2
)
```

Estado inicial:

```text
A
B
```

---

# Executando o Service

Passamos:

```typescript
attachmentIds:
[
  A,
  C
]
```

Observe:

```text
A -> permanece
B -> removido
C -> adicionado
```

---

# Validando Resultado

Após a execução:

```typescript
question.attachments.currentItems()
```

deve conter:

```text
A
C
```

---

## Validando quantidade

```typescript
expect(
  question.attachments
    .currentItems()
).toHaveLength(2)
```

---

## Validando IDs

Verificamos se os IDs correspondem ao resultado esperado.

```text
A
C
```

e não mais:

```text
A
B
```

---

# Fluxo Completo

```text
Banco
 │
 ├── A
 ├── B
 │
 ▼

QuestionAttachmentList
(initial)

[A,B]

 ▼

Usuário envia

[A,C]

 ▼

update()

 ▼

Current:
[A,C]

Removed:
[B]

New:
[C]

 ▼

Question.attachments

 ▼

Repository.save(question)
```

---

# Resumo

Nesta refatoração a coleção de anexos deixou de ser um array simples e passou a ser uma WatchedList especializada.

As principais mudanças foram:

* criação da classe QuestionAttachmentList;
* implementação do método compareItems;
* substituição de arrays por WatchedList na entidade Question;
* adaptação do Service de criação;
* criação do QuestionAttachmentsRepository;
* carregamento dos anexos atuais durante edição;
* utilização do método update para detectar alterações;
* implementação do repositório InMemory;
* atualização dos testes para trabalhar com currentItems().

Com isso o Aggregate passa a rastrear automaticamente quais relacionamentos devem ser criados ou removidos, simplificando bastante a persistência futura em banco de dados real.
:::
