# Marcar Notificação Como Lida

Objetivo: permitir que apenas o destinatário da notificação possa marcá-la como lida.

---

# Ajustes no Repositório

Adicionar os contratos necessários:

```ts
abstract findById(id: string): Promise<Notification | null>
abstract save(notification: Notification): Promise<void>
```

Implementação InMemory:

```ts
async findById(id: string) {
  return this.items.find(item => item.id.toString() === id) ?? null
}

async save(notification: Notification) {
  const itemIndex = this.items.findIndex(
    item => item.id.equals(notification.id),
  )

  this.items[itemIndex] = notification
}
```

---

# Service

Recebe:

```ts
{
  recipientId: string
  notificationId: string
}
```

Fluxo:

```text
Buscar notificação
      ↓
Existe?
      ↓
Validar recipientId
      ↓
Marcar como lida
      ↓
Salvar
```

Validações:

```ts
const notification =
  await notificationsRepository.findById(notificationId)

if (!notification) {
  return left(new ResourceNotFoundError())
}

if (notification.recipientId.toString() !== recipientId) {
  return left(new NotAllowedError())
}
```

---

# Entidade

Criar método responsável pela regra de negócio:

```ts
read() {
  this.props.readAt = new Date()
}
```

Uso:

```ts
notification.read()
```

---

# Persistindo Alteração

Após marcar como lida:

```ts
notification.read()

await notificationsRepository.save(notification)
```

---

# Factory

Facilita a criação de notificações nos testes:

```ts
const notification = makeNotification()
```

---

# Teste de Sucesso

Validar:

```ts
expect(result.isRight()).toBe(true)

expect(notification.readAt).toEqual(expect.any(Date))
```

---

# Teste de Autorização

Outro usuário não pode ler a notificação:

```ts
expect(result.isLeft()).toBe(true)
```

---

# Resumo

```text
Repository
 ├─ findById()
 └─ save()

Service
 ├─ busca notificação
 ├─ valida existência
 ├─ valida destinatário
 ├─ chama read()
 └─ salva

Entity
 └─ read()

Testes
 ├─ marca como lida
 └─ bloqueia outro usuário
```
