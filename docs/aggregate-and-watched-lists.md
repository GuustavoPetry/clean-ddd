# Aggregate e WatchedList no Domain-Driven Design

## Introdução

Ao modelar um domínio complexo utilizando Domain-Driven Design (DDD), nem todas as entidades devem ser manipuladas diretamente pelo sistema. Algumas entidades existem apenas para complementar outras e precisam obedecer às mesmas regras de negócio da entidade principal.

Para resolver esse problema, o DDD introduz o conceito de **Aggregate**.

Além disso, quando um Aggregate possui coleções de entidades filhas, surge um novo desafio: como identificar quais itens foram adicionados, removidos ou modificados durante uma atualização?

É nesse cenário que o padrão **WatchedList** se torna útil.

---

# Aggregate

## O que é?

Um Aggregate é um conjunto de objetos de domínio que devem ser tratados como uma única unidade de consistência.

Ele define um limite (boundary) dentro do domínio.

Tudo que estiver dentro desse limite deve ser manipulado através de uma entidade principal chamada:

**Aggregate Root**

---

## Objetivo

O Aggregate existe para garantir que as regras de negócio sejam preservadas.

Em vez de permitir alterações diretas nas entidades internas, toda modificação passa pela Aggregate Root.

Isso garante que o estado do domínio permaneça válido.

---

## Estrutura

```text
Order (Aggregate Root)
│
├── OrderItem
├── OrderItem
├── OrderItem
│
└── Shipping
```

Nesse exemplo:

- Order é o Aggregate Root
- OrderItem pertence ao Aggregate
- Shipping pertence ao Aggregate

Nenhum código externo deveria alterar diretamente um OrderItem.

Tudo deve acontecer através do Order.

---

## Exemplo: Pedido

### Entidades

```typescript
class Order {
  items: OrderItem[]
  shipping: Shipping
}

class OrderItem {
  productId: string
  quantity: number
}

class Shipping {
  address: string
}
```

---

### Operações válidas

```typescript
order.addItem(item)

order.removeItem(itemId)

order.changeShippingAddress(address)
```

---

### Operações inválidas

```typescript
order.items[0].quantity = 999
```

ou

```typescript
repository.save(order.items[0])
```

Isso quebra o encapsulamento do Aggregate.

---

## Persistência

Uma característica importante é:

**O Aggregate inteiro é salvo através da Aggregate Root.**

Exemplo:

```typescript
await orderRepository.save(order)
```

O repositório é responsável por:

- Salvar o Order
- Salvar os OrderItems
- Salvar o Shipping

Tudo em uma única operação de consistência.

---

# Aggregate Root

## Definição

É a entidade principal do Aggregate.

Responsabilidades:

- Controlar acesso às entidades internas
- Garantir regras de negócio
- Ser o único ponto de persistência

---

## Exemplo

```typescript
class Order {
  private items: OrderItem[]

  addItem(item: OrderItem) {
    this.items.push(item)
  }

  removeItem(itemId: string) {
    this.items = this.items.filter(
      item => item.id !== itemId
    )
  }
}
```

Todo acesso aos itens passa pela raiz.

---

# Aggregate no contexto do Fórum

## Estrutura

```text
Question (Aggregate Root)
│
└── Attachments
```

Onde:

```typescript
class Question {
  title: string
  content: string
  attachments: Attachment[]
}
```

---

## Criação

Usuário cria uma pergunta:

```text
Título: Como funciona DDD?
Conteúdo: Tenho dúvidas...
Anexos:
- anexo1
- anexo2
- anexo3
```

O Aggregate nasce completo.

```typescript
const question = Question.create({
  title,
  content,
  attachments
})
```

---

## Edição

O usuário altera:

```text
Título: Como funciona DDD na prática?
Conteúdo: Atualizado.

Anexos:
+ Novo anexo
- Remove segundo anexo
```

Nesse momento o sistema precisa descobrir:

- Quais anexos foram adicionados
- Quais anexos foram removidos
- Quais permaneceram

Essa é exatamente a responsabilidade da WatchedList.

---

# Problema das listas em Aggregates

Imagine a pergunta:

```text
Anexos atuais:
- A
- B
- C
```

Após edição:

```text
Anexos novos:
- A
- C
- D
```

O sistema precisa concluir:

```text
B -> removido
D -> criado
A -> mantido
C -> mantido
```

Sem uma estrutura específica, o repositório teria que implementar toda essa lógica manualmente.

---

# WatchedList

## O que é?

WatchedList é um objeto especializado que observa mudanças em uma coleção.

Ela mantém dois estados:

- Estado original
- Estado atual

A partir disso consegue determinar:

- Itens adicionados
- Itens removidos
- Itens existentes

---

## Objetivo

Permitir que o Aggregate trabalhe normalmente enquanto o repositório descobre exatamente o que precisa persistir.

---

## Estrutura conceitual

```typescript
class WatchedList<T> {
  private currentItems: T[]
  private initialItems: T[]
}
```

Quando a entidade é carregada do banco:

```typescript
attachments = [
  A,
  B,
  C
]
```

A WatchedList registra:

```typescript
initialItems = [A, B, C]
currentItems = [A, B, C]
```

---

## Adicionando item

```typescript
attachments.add(D)
```

Agora:

```typescript
currentItems = [A, B, C, D]
```

A WatchedList sabe que:

```text
D foi criado
```

---

## Removendo item

```typescript
attachments.remove(B)
```

Agora:

```typescript
currentItems = [A, C, D]
```

Comparando com o estado inicial:

```text
B foi removido
D foi criado
```

---

# Métodos comuns

## currentItems()

Retorna os itens atuais.

```typescript
attachments.currentItems()
```

Resultado:

```typescript
[A, C, D]
```

---

## getNewItems()

Retorna itens criados.

```typescript
attachments.getNewItems()
```

Resultado:

```typescript
[D]
```

---

## getRemovedItems()

Retorna itens removidos.

```typescript
attachments.getRemovedItems()
```

Resultado:

```typescript
[B]
```

---

## exists()

Verifica se item já está presente.

```typescript
attachments.exists(item)
```

---

# Fluxo completo de atualização

## Estado inicial

```text
Question
 ├─ A
 ├─ B
 └─ C
```

---

## Usuário envia atualização

```text
Question
 ├─ A
 ├─ C
 └─ D
```

---

## WatchedList detecta

```text
Criados:
- D

Removidos:
- B

Mantidos:
- A
- C
```

---

## Repository

```typescript
await questionRepository.save(question)
```

Internamente:

```typescript
for (const item of attachments.getNewItems()) {
  createAttachment(item)
}

for (const item of attachments.getRemovedItems()) {
  deleteAttachment(item)
}

updateQuestion(question)
```

O Aggregate continua simples e o repositório sabe exatamente quais operações executar.

---

# Benefícios do Aggregate

- Mantém consistência do domínio
- Protege regras de negócio
- Evita alterações indevidas
- Centraliza operações
- Facilita manutenção

---

# Benefícios da WatchedList

- Detecta mudanças automaticamente
- Facilita sincronização com banco de dados
- Evita comparações manuais complexas
- Reduz lógica dentro dos repositórios
- Funciona perfeitamente com Aggregates

---

# Relação entre Aggregate e WatchedList

Os dois padrões normalmente aparecem juntos.

O Aggregate controla as regras de negócio.

A WatchedList controla as mudanças nas coleções internas do Aggregate.

Exemplo:

```text
Question (Aggregate Root)
│
└── QuestionAttachment (WatchedList)
```

Fluxo:

Usuário → Aggregate → WatchedList → Repository → Banco de Dados

Cada camada possui uma responsabilidade clara:

- Aggregate: regras de negócio.
- WatchedList: rastreamento de alterações.
- Repository: persistência.
- Banco: armazenamento.