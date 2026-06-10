# Implementação Completa de Anexos em Answers

## Introdução

Após implementar toda a estrutura de anexos para a entidade **Question**, o próximo passo foi replicar o mesmo comportamento para **Answer**.

O objetivo era fazer com que respostas também fossem capazes de:

* possuir anexos;
* criar anexos durante a criação da resposta;
* editar anexos posteriormente;
* rastrear alterações através da WatchedList;
* excluir anexos automaticamente quando a resposta fosse removida;
* manter consistência do Aggregate.

Ao final da implementação, tanto **Question** quanto **Answer** passaram a possuir exatamente o mesmo comportamento em relação aos anexos.

---

# Arquitetura Final

Estrutura do domínio:

```text
Answer (Aggregate Root)
│
└── AnswerAttachmentList
     │
     ├── AnswerAttachment
     ├── AnswerAttachment
     └── AnswerAttachment
```

Da mesma forma que:

```text
Question (Aggregate Root)
│
└── QuestionAttachmentList
```

Agora existe:

```text
Answer (Aggregate Root)
│
└── AnswerAttachmentList
```

---

# 1. Criando AnswerAttachmentList

Arquivo:

```text
src/domain/forum/enterprise/entities/answer-attachment-list.ts
```

Objetivo:

Especializar a WatchedList para trabalhar apenas com:

```typescript
AnswerAttachment
```

---

## Implementação

```typescript
export class AnswerAttachmentList
  extends WatchedList<AnswerAttachment> {
}
```

Agora a lista consegue rastrear alterações de anexos da resposta.

---

# 2. Implementando compareItems()

A WatchedList exige a implementação do método:

```typescript
compareItems(
  a,
  b
)
```

Como estamos trabalhando com entidades:

```typescript
AnswerAttachment
```

precisamos definir quando dois itens são considerados iguais.

---

## Implementação

```typescript
compareItems(
  a: AnswerAttachment,
  b: AnswerAttachment
): boolean {
  return a.attachmentId.equals(
    b.attachmentId
  )
}
```

---

## Exemplo

```typescript
attachment-1
```

comparado com:

```typescript
attachment-1
```

Resultado:

```typescript
true
```

---

Comparando:

```typescript
attachment-1
```

com:

```typescript
attachment-2
```

Resultado:

```typescript
false
```

---

# 3. Incluindo propriedade attachments

Antes:

```typescript
interface AnswerProps {
  content: string
  authorId: UniqueEntityID
  questionId: UniqueEntityID
}
```

---

Depois:

```typescript
interface AnswerProps {
  content: string
  authorId: UniqueEntityID
  questionId: UniqueEntityID
  attachments: AnswerAttachmentList
}
```

Agora a entidade consegue armazenar seus relacionamentos.

---

# 4. Criando Getter

```typescript
get attachments() {
  return this.props.attachments
}
```

Uso:

```typescript
answer.attachments
```

---

# 5. Criando Setter

```typescript
set attachments(
  attachments: AnswerAttachmentList
) {
  this.props.attachments = attachments
}
```

Uso:

```typescript
answer.attachments = attachmentList
```

---

# 6. Adicionando attachments na entidade Answer

A entidade passa a possuir:

```typescript
attachments: AnswerAttachmentList
```

como parte do Aggregate.

---

## Estrutura

```text
Answer
│
├── content
├── authorId
├── questionId
└── attachments
```

---

# 7. Tornando attachments opcional no create

Antes:

```typescript
Answer.create({
  content,
  authorId,
  questionId,
  attachments
})
```

---

Agora:

```typescript
Answer.create({
  content,
  authorId,
  questionId
})
```

também funciona.

---

## Implementação

```typescript
attachments:
  props.attachments ??
  new AnswerAttachmentList([])
```

---

Benefício:

Sempre existe uma lista válida.

---

# 8. Alterando CreateAnswer Service

A criação da resposta passa a receber:

```typescript
attachmentIds: string[]
```

---

## Exemplo

```typescript
{
  content: "Minha resposta",
  attachmentIds: [
    "attachment-1",
    "attachment-2"
  ]
}
```

---

## Por que apenas IDs?

Os anexos já foram criados previamente.

O fluxo é:

```text
Upload
   │
   ▼
Attachment criado
   │
   ▼
Retorna ID
   │
   ▼
CreateAnswer recebe IDs
```

---

# 9. Instanciando AnswerAttachment

Recebemos:

```typescript
[
  "attachment-1",
  "attachment-2"
]
```

Precisamos converter para:

```typescript
[
  AnswerAttachment,
  AnswerAttachment
]
```

---

## Utilizando map()

```typescript
const attachments =
  attachmentIds.map(
    attachmentId => {
      return AnswerAttachment.create({
        answerId: answer.id,
        attachmentId:
          new UniqueEntityID(
            attachmentId
          )
      })
    }
  )
```

---

# 10. Atribuindo os anexos

Após criar os relacionamentos:

```typescript
answer.attachments =
  new AnswerAttachmentList(
    attachments
  )
```

Resultado:

```text
Answer
│
├── Attachment A
└── Attachment B
```

---

# 11. Fazendo os testes de criação passarem

Os testes foram atualizados para validar:

```typescript
answer.attachments
```

---

Agora:

```typescript
answer.attachments.currentItems()
```

deve possuir:

```typescript
[
  attachment1,
  attachment2
]
```

---

# 12. Criando AnswerAttachmentsRepository

Arquivo:

```text
answer-attachments-repository.ts
```

---

Responsabilidade:

Buscar anexos vinculados a uma resposta.

---

## Método

```typescript
findManyByAnswerId(
  answerId: string
): Promise<AnswerAttachment[]>
```

---

# 13. Implementando InMemoryAnswerAttachmentsRepository

Coleção:

```typescript
items: AnswerAttachment[]
```

---

Implementação:

```typescript
async findManyByAnswerId(
  answerId: string
) {
  return this.items.filter(
    item =>
      item.answerId.toString() ===
      answerId
  )
}
```

---

# 14. Buscando anexos atuais na edição

Antes de editar precisamos carregar os anexos existentes.

```typescript
const currentAttachments =
  await answerAttachmentsRepository
    .findManyByAnswerId(
      answer.id.toString()
    )
```

---

Exemplo:

```text
A
B
C
```

---

# 15. Criando nova lista a partir dos IDs recebidos

Recebemos:

```typescript
[
  "A",
  "C",
  "D"
]
```

Convertendo:

```typescript
const attachments =
  attachmentIds.map(...)
```

Resultado:

```text
A
C
D
```

---

# 16. Atualizando a WatchedList

Criamos:

```typescript
const attachmentList =
  new AnswerAttachmentList(
    currentAttachments
  )
```

---

Atualizamos:

```typescript
attachmentList.update(
  attachments
)
```

---

Internamente:

```text
Atual:
A
B
C

Novo:
A
C
D
```

Resultado:

```text
Removed:
B

New:
D
```

---

Depois:

```typescript
answer.attachments =
  attachmentList
```

---

# 17. Criando Factory

Arquivo:

```text
make-answer-attachment.ts
```

---

Objetivo:

Simplificar criação nos testes.

---

Exemplo:

```typescript
const attachment =
  makeAnswerAttachment()
```

---

# 18. Fazendo testes de edição passarem

Os testes verificam:

* quantidade correta;
* anexos removidos;
* anexos adicionados;
* lista atualizada.

---

Exemplo:

Estado inicial:

```text
A
B
```

Atualização:

```text
A
C
```

Resultado esperado:

```text
A
C
```

---

# 19. Excluindo anexos quando a resposta é removida

Problema:

Antes:

```text
Delete Answer
```

mas:

```text
AnswerAttachment
```

continuava existindo.

---

Resultado:

```text
Dados órfãos
```

---

## Solução

Criar:

```typescript
deleteManyByAnswerId()
```

no repository.

---

Implementação:

```typescript
async deleteManyByAnswerId(
  answerId: string
) {
  this.items = this.items.filter(
    item =>
      item.answerId.toString() !==
      answerId
  )
}
```

---

# Integração com o Repository de Answer

Ao remover:

```typescript
await answersRepository.delete(
  answer
)
```

executamos:

```typescript
await answerAttachmentsRepository
  .deleteManyByAnswerId(
    answer.id.toString()
  )
```

antes da remoção da resposta.

---

Fluxo:

```text
Delete Answer
      │
      ▼
Delete Attachments
      │
      ▼
Delete Answer
```

---

# 20. Fazendo testes de exclusão passarem

Validações:

```typescript
expect(
  answersRepository.items
).toHaveLength(0)
```

e

```typescript
expect(
  answerAttachmentsRepository.items
).toHaveLength(0)
```

---

# 21. Executando TypeScript Check

Com todas as alterações realizadas:

```bash
npx tsc --noEmit
```

---

## Objetivo

Verificar:

* tipos incorretos;
* imports faltando;
* incompatibilidades;
* erros de inferência.

---

Sem gerar arquivos compilados.

---

# 22. Corrigindo erros de TypeScript

Alguns erros comuns encontrados:

```typescript
QuestionAttachmentList
```

onde deveria ser:

```typescript
AnswerAttachmentList
```

---

Ou:

```typescript
QuestionAttachment
```

onde deveria ser:

```typescript
AnswerAttachment
```

---

Após corrigir:

```bash
npx tsc --noEmit
```

sem erros.

---

# 23. Corrigindo teste get-question-by-slug

Foi encontrado um problema no teste:

```typescript
expect(...)
```

não validava corretamente toda a estrutura retornada.

---

## Solução

Utilizar:

```typescript
toMatchObject()
```

---

Exemplo:

```typescript
expect(result).toMatchObject({
  question: {
    title: "Minha pergunta"
  }
})
```

---

## Benefício

Permite validar objetos complexos sem exigir igualdade exata de instâncias.

Muito útil quando existem:

```typescript
UniqueEntityID
Date
Value Objects
Entidades
```

---

# Resultado Final

Ao término da implementação, a entidade Answer passou a possuir exatamente os mesmos recursos de anexos que já existiam em Question.

Funcionalidades implementadas:

```text
✔ Criar resposta com anexos

✔ Editar anexos da resposta

✔ Detectar anexos adicionados

✔ Detectar anexos removidos

✔ Persistir alterações através da WatchedList

✔ Remover anexos automaticamente ao excluir resposta

✔ Cobertura completa de testes

✔ Verificação de tipos com TypeScript
```

A arquitetura final permanece consistente com os princípios de DDD, utilizando Aggregate Roots, WatchedLists, Repositories especializados e baixo acoplamento entre as entidades do domínio.
:::
