# Criando uma Question com Attachments

## Objetivo

Nesta etapa do desenvolvimento foi implementada a criação de uma pergunta (**Question**) contendo anexos (**Attachments**) associados ao seu Aggregate.

O ponto mais importante dessa implementação é entender que os anexos não são enviados junto da criação da pergunta.

Primeiro os arquivos são enviados e cadastrados no sistema.

Somente depois a pergunta é criada, recebendo os IDs dos anexos previamente existentes.

Essa abordagem é muito comum em aplicações modernas e resolve diversos problemas relacionados a upload de arquivos.

---

# Arquitetura da solução

O fluxo implementado segue o seguinte processo:

```text
Usuário seleciona arquivos
        │
        ▼
Upload dos arquivos
(multipart/form-data)
        │
        ▼
Attachments são criados
        │
        ▼
Retorno dos IDs
        │
        ▼
Usuário cria a pergunta
(JSON)
        │
        ▼
Question recebe attachmentIds
```

Exemplo:

```text
Arquivo 1 → attachment-1
Arquivo 2 → attachment-2
```

Posteriormente:

```json
{
  "title": "Como funciona DDD?",
  "content": "Tenho dúvidas sobre aggregates.",
  "attachmentsIds": [
    "attachment-1",
    "attachment-2"
  ]
}
```

---

# 1. Alterações na entidade Question

## Adicionando attachments em QuestionProps

Inicialmente a entidade Question possuía apenas os dados da pergunta.

```typescript
interface QuestionProps {
  authorId: UniqueEntityID
  title: string
  content: string
}
```

Agora ela passa a armazenar também os relacionamentos com anexos.

```typescript
interface QuestionProps {
  authorId: UniqueEntityID
  title: string
  content: string
  attachments: QuestionAttachment[]
}
```

---

## Por que armazenar QuestionAttachment?

Observe que não estamos armazenando:

```typescript
Attachment[]
```

e sim:

```typescript
QuestionAttachment[]
```

Isso acontece porque o Aggregate não controla diretamente os arquivos.

Ele controla os relacionamentos.

Estrutura:

```text
Question
│
├── QuestionAttachment
├── QuestionAttachment
└── QuestionAttachment
```

Cada QuestionAttachment representa um vínculo entre:

```text
Question
↕
Attachment
```

---

## Criando o getter

Para permitir acesso aos anexos sem expor diretamente as propriedades internas:

```typescript
get attachments() {
  return this.props.attachments
}
```

Uso:

```typescript
question.attachments
```

ao invés de:

```typescript
question.props.attachments
```

---

## Tornando attachments opcional no create

Ao criar uma pergunta nem sempre existirão anexos.

Por isso a propriedade deve ser opcional.

```typescript
static create(
  props: Optional<QuestionProps, "attachments">,
  id?: UniqueEntityID,
) {
  ...
}
```

Agora é possível criar:

```typescript
Question.create({
  authorId,
  title,
  content
})
```

sem fornecer anexos.

---

## Inicializando com array vazio

Caso nenhum anexo seja informado:

```typescript
const question = new Question({
  ...props,
  attachments: props.attachments ?? [],
})
```

Isso evita problemas como:

```typescript
undefined.map(...)
```

ou

```typescript
undefined.length
```

---

## Criando o setter

Também foi criado um setter para permitir que os anexos sejam atribuídos após a criação da pergunta.

```typescript
set attachments(attachments: QuestionAttachment[]) {
  this.props.attachments = attachments
}
```

Uso:

```typescript
question.attachments = attachments
```

---

# 2. Implementação do CreateQuestion

## Estratégia moderna para upload

Uma dúvida comum é:

"Por que não enviar tudo em uma única requisição?"

Exemplo:

```text
Pergunta
+
Arquivos
```

A resposta é que uploads utilizam:

```http
multipart/form-data
```

enquanto APIs modernas normalmente trabalham com:

```http
application/json
```

Separar essas responsabilidades simplifica bastante o backend.

---

## Rota de upload

Primeira requisição:

```http
POST /attachments
```

Envia:

```text
arquivo.pdf
imagem.png
```

Resultado:

```json
[
  {
    "id": "attachment-1"
  },
  {
    "id": "attachment-2"
  }
]
```

---

## Rota de criação da pergunta

Segunda requisição:

```http
POST /questions
```

```json
{
  "title": "Como funciona DDD?",
  "content": "...",
  "attachmentsIds": [
    "attachment-1",
    "attachment-2"
  ]
}
```

---

# Adicionando attachmentsIds no caso de uso

A entrada do caso de uso passa a receber:

```typescript
attachmentsIds: string[]
```

Exemplo:

```typescript
interface CreateQuestionRequest {
  authorId: string
  title: string
  content: string
  attachmentsIds: string[]
}
```

Observe que recebemos apenas IDs.

Não recebemos objetos Attachment.

---

# Criando a Question sem anexos

Primeiro criamos a pergunta normalmente.

```typescript
const question = Question.create({
  authorId,
  title,
  content,
})
```

Nesse momento:

```typescript
question.attachments
```

é:

```typescript
[]
```

---

# Convertendo IDs em QuestionAttachments

Como attachmentsIds é um array de strings:

```typescript
[
  "attachment-1",
  "attachment-2"
]
```

precisamos transformá-los em entidades de domínio.

Para isso utilizamos:

```typescript
map()
```

---

## Exemplo

```typescript
const attachments = attachmentsIds.map(
  attachmentId => {
    return QuestionAttachment.create({
      questionId: question.id,
      attachmentId: new UniqueEntityID(attachmentId),
    })
  }
)
```

Resultado:

```typescript
[
  QuestionAttachment,
  QuestionAttachment
]
```

Cada item agora é uma entidade válida do domínio.

---

# Associando os anexos à pergunta

Depois da conversão:

```typescript
question.attachments = attachments
```

O Aggregate fica completo.

Estrutura final:

```text
Question
│
├── QuestionAttachment
│
└── QuestionAttachment
```

---

# Persistência do Aggregate

## Como funciona no mundo real

Ao salvar:

```typescript
questionRepository.create(question)
```

o repositório da Question é responsável por persistir:

```text
Question
QuestionAttachments
```

Isso acontece porque ambos pertencem ao mesmo Aggregate.

---

## Importante

Não devemos fazer:

```typescript
questionRepository.create(question)

questionAttachmentRepository.create(...)
```

Isso quebra o conceito de Aggregate.

O Aggregate deve ser persistido pela sua Root.

---

## Responsabilidade do Repository

Em uma implementação real:

```typescript
questionRepository.create(question)
```

internamente poderia executar:

```typescript
INSERT INTO questions

INSERT INTO question_attachments
```

Tudo dentro da mesma operação.

---

## Por que o InMemoryRepository não faz isso?

No ambiente de testes os anexos já estão dentro da instância.

Exemplo:

```typescript
questions.push(question)
```

Como os dados estão em memória, não existe necessidade de sincronizar tabelas.

Por isso essa lógica é ignorada no repositório fake.

---

# 3. Testando a criação

## Preparação

Ao executar o caso de uso:

```typescript
await sut.execute({
  authorId: "author-1",
  title: "Pergunta",
  content: "Conteúdo",
  attachmentsIds: [
    "attachment-1",
    "attachment-2"
  ]
})
```

esperamos que os relacionamentos sejam criados corretamente.

---

# Validando quantidade de anexos

Primeira verificação:

```typescript
expect(items[0].attachments).toHaveLength(2)
```

Isso garante que:

```text
attachment-1
attachment-2
```

foram convertidos em entidades de relacionamento.

---

# Validando os IDs

Também verificamos se os relacionamentos foram criados corretamente.

Exemplo:

```typescript
expect(items[0].attachments).toEqual([
  expect.objectContaining({
    attachmentId: new UniqueEntityID("attachment-1")
  }),
  expect.objectContaining({
    attachmentId: new UniqueEntityID("attachment-2")
  })
])
```

Ou usando a abordagem equivalente ensinada no curso.

O objetivo é confirmar que os IDs recebidos na entrada foram transformados em QuestionAttachments válidos.

---

# Fluxo Completo

```text
Usuário seleciona arquivos
        │
        ▼
Attachments são criados
        │
        ▼
Recebe IDs dos anexos
        │
        ▼
CreateQuestion recebe:
[
  attachment-1,
  attachment-2
]
        │
        ▼
QuestionAttachment.create(...)
        │
        ▼
Question.attachments =
[
  QuestionAttachment,
  QuestionAttachment
]
        │
        ▼
QuestionRepository.save(question)
```

---

# Resumo

Nesta implementação:

* Question passou a possuir uma coleção de QuestionAttachments.
* O create da entidade passou a aceitar attachments opcionalmente.
* Foi criado um setter para permitir atribuição posterior.
* O caso de uso recebe apenas attachmentsIds.
* Cada ID é transformado em uma entidade QuestionAttachment usando map().
* Os relacionamentos são atribuídos à Question.
* O Aggregate completo é persistido através do QuestionRepository.
* Os testes validam tanto a quantidade quanto os IDs dos anexos associados.

Essa implementação segue os princípios de DDD ao manter a Question como Aggregate Root e garantir que os relacionamentos com anexos sejam gerenciados pela própria raiz do agregado.
:::
