# Pattern Watched List e Testes Unitários

## Introdução

Ao trabalhar com Aggregates no Domain-Driven Design (DDD), frequentemente encontramos coleções de entidades que precisam ser sincronizadas com o banco de dados.

Um exemplo clássico é:

```text
Question
│
├── Attachment A
├── Attachment B
└── Attachment C
```

Após uma edição, a coleção pode se tornar:

```text
Question
│
├── Attachment A
├── Attachment C
└── Attachment D
```

Nesse cenário, o sistema precisa descobrir:

```text
Attachment B → Remover
Attachment D → Criar
Attachment A → Manter
Attachment C → Manter
```

Sem uma estrutura específica, o repositório precisaria comparar manualmente os estados antigo e novo da coleção.

O Pattern Watched List existe justamente para resolver esse problema.

---

# O que é uma Watched List?

Watched List é uma estrutura especializada que monitora alterações em uma coleção.

Ela se comporta como um array comum para o domínio, mas internamente mantém informações extras necessárias para persistência.

Seu objetivo é responder perguntas como:

```text
Quais itens foram adicionados?

Quais itens foram removidos?

Quais itens permaneceram?
```

Essas informações serão utilizadas posteriormente pelo Repository.

---

# Estrutura da Classe

A Watched List normalmente é uma classe abstrata.

Exemplo simplificado:

```typescript
export abstract class WatchedList<T> {
  protected currentItems: T[]
  protected initial: T[]
  protected new: T[]
  protected removed: T[]
}
```

Ela utiliza Generic Types para funcionar com qualquer tipo de entidade.

Exemplos:

```typescript
WatchedList<QuestionAttachment>
```

```typescript
WatchedList<AnswerAttachment>
```

```typescript
WatchedList<number>
```

---

# currentItems

Representa o estado atual da coleção.

Exemplo inicial:

```typescript
[1, 2, 3]
```

Após adicionar um item:

```typescript
[1, 2, 3, 4]
```

Após remover:

```typescript
[1, 3, 4]
```

O método:

```typescript
currentItems()
```

sempre retorna essa versão mais recente.

---

# initial

Armazena o estado original da lista.

Quando a Watched List é criada:

```typescript
new NumberList([1, 2, 3])
```

o valor inicial fica armazenado:

```typescript
initial = [1, 2, 3]
```

Esse array nunca é alterado.

Ele serve como referência para comparação.

---

# new

Armazena os itens adicionados após a criação da lista.

Exemplo:

```typescript
[1, 2, 3]
```

Adicionando:

```typescript
4
```

resultado:

```typescript
new = [4]
```

Esses são os itens que futuramente deverão ser inseridos no banco.

---

# removed

Armazena os itens removidos após a criação da lista.

Exemplo:

```typescript
[1, 2, 3]
```

Removendo:

```typescript
2
```

resultado:

```typescript
removed = [2]
```

Esses serão os itens que deverão ser deletados do banco.

---

# Funcionamento Geral

Estado inicial:

```text
Initial:
[1,2,3]
```

Após adicionar:

```text
Add(4)
```

Temos:

```text
Current:
[1,2,3,4]

New:
[4]

Removed:
[]
```

---

Após remover:

```text
Remove(2)
```

Temos:

```text
Current:
[1,3,4]

New:
[4]

Removed:
[2]
```

---

# Método compareItems

Como a Watched List é genérica, ela não sabe como comparar objetos.

Por isso existe um método abstrato.

```typescript
protected abstract compareItems(
  a: T,
  b: T
): boolean
```

Cada implementação define sua própria regra.

---

# Implementação para testes

Nos testes foi criada uma classe utilizando números.

```typescript
class NumberList extends WatchedList<number> {
  compareItems(a: number, b: number) {
    return a === b
  }
}
```

Agora a Watched List sabe comparar:

```typescript
1 === 1
```

e

```typescript
1 !== 2
```

---

# Teste 1 - Criar lista com itens iniciais

Objetivo:

Garantir que a lista seja criada corretamente.

---

## Preparação

```typescript
const list = new NumberList([1,2,3])
```

---

## Validação

```typescript
expect(
  list.currentItems()
).toHaveLength(3)
```

Resultado esperado:

```text
[1,2,3]
```

Comprimento:

```text
3
```

---

# Teste 2 - Adicionar novo item

Objetivo:

Garantir que novos itens sejam registrados corretamente.

---

## Preparação

```typescript
const list = new NumberList([1,2,3])

list.add(4)
```

---

## Estado esperado

```text
Current:
[1,2,3,4]

New:
[4]

Removed:
[]
```

---

## Validações

```typescript
expect(
  list.currentItems()
).toHaveLength(4)
```

```typescript
expect(
  list.getNewItems()
).toEqual([4])
```

---

# Teste 3 - Remover item

Objetivo:

Garantir que remoções sejam rastreadas.

---

## Preparação

```typescript
const list = new NumberList([1,2,3])

list.remove(2)
```

---

## Estado esperado

```text
Current:
[1,3]

Removed:
[2]
```

---

## Validações

```typescript
expect(
  list.currentItems()
).toHaveLength(2)
```

```typescript
expect(
  list.getRemovedItems()
).toEqual([2])
```

---

# Teste 4 - Remover e adicionar novamente

Objetivo:

Validar cancelamento de operação.

---

## Cenário

```typescript
const list = new NumberList([1,2,3])

list.remove(2)

list.add(2)
```

---

## O que aconteceu?

Primeiro:

```text
2 → removido
```

Depois:

```text
2 → voltou para lista
```

No resultado final nada mudou em relação ao estado original.

---

## Estado esperado

```text
Current:
[1,2,3]

Removed:
[]

New:
[]
```

---

## Validações

```typescript
expect(
  list.getRemovedItems()
).toEqual([])
```

```typescript
expect(
  list.getNewItems()
).toEqual([])
```

---

# Teste 5 - Adicionar e remover

Objetivo:

Validar o cenário inverso.

---

## Cenário

```typescript
const list = new NumberList([1,2,3])

list.add(4)

list.remove(4)
```

---

## O que aconteceu?

O item nunca existiu no estado inicial.

Foi criado e removido antes da persistência.

Logo:

```text
Nada precisa ser salvo.
Nada precisa ser removido.
```

---

## Estado esperado

```text
Current:
[1,2,3]

Removed:
[]

New:
[]
```

---

## Validações

```typescript
expect(
  list.getRemovedItems()
).toEqual([])
```

```typescript
expect(
  list.getNewItems()
).toEqual([])
```

---

# Teste 6 - Atualizar lista inteira

Objetivo:

Validar sincronização completa da coleção.

---

## Estado inicial

```typescript
[1,2,3]
```

---

## Atualização

```typescript
list.update([
  1,
  3,
  4,
  5
])
```

---

## Comparação

Itens removidos:

```text
2
```

Itens adicionados:

```text
4
5
```

Itens mantidos:

```text
1
3
```

---

## Estado esperado

```text
Current:
[1,3,4,5]

Removed:
[2]

New:
[4,5]
```

---

## Validações

```typescript
expect(
  list.getRemovedItems()
).toEqual([2])
```

```typescript
expect(
  list.getNewItems()
).toEqual([4,5])
```

---

# Relação com Repositories

A principal utilidade da Watched List aparece no momento da persistência.

Imagine:

```typescript
question.attachments
```

ser uma Watched List.

Ao salvar:

```typescript
questionRepository.save(question)
```

o repositório pode fazer:

```typescript
attachments.getNewItems()
```

para criar novos registros.

E:

```typescript
attachments.getRemovedItems()
```

para remover registros antigos.

Sem precisar comparar arrays manualmente.

---

# Benefícios da Watched List

## Centraliza a lógica de sincronização

A comparação de listas fica em um único lugar.

---

## Simplifica os Repositories

O repositório apenas consulta:

```typescript
getNewItems()
```

e

```typescript
getRemovedItems()
```

---

## Evita comparações manuais

Não é necessário escrever algoritmos repetidos de diff entre arrays.

---

## Funciona perfeitamente com Aggregates

Especialmente em entidades como:

```text
Question
 └── QuestionAttachments
```

```text
Answer
 └── AnswerAttachments
```

onde coleções são alteradas frequentemente.

---

# Resumo

A Watched List é uma estrutura especializada para monitorar alterações em coleções dentro do domínio.

Ela mantém quatro estados principais:

```typescript
currentItems
initial
new
removed
```

permitindo descobrir automaticamente:

* quais itens foram adicionados;
* quais itens foram removidos;
* quais itens permaneceram;
* qual é o estado atual da coleção.

Os testes unitários servem para validar todos os cenários importantes de sincronização, garantindo que a estrutura funcione corretamente antes de ser utilizada pelos Aggregates e Repositories do sistema.
:::
