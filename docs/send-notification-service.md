# Implementação do Caso de Uso: Criação de Notificação

Objetivo: criar uma notificação, persisti-la no repositório e garantir o funcionamento através de testes unitários.

---

# 1. Criar NotificationsRepository

Arquivo:

```ts
// notifications-repository.ts

import { Notification } from '@/domain/notification/enterprise/entities/notification'

export abstract class NotificationsRepository {
  abstract create(notification: Notification): Promise<void>
}
```

Responsabilidade:

- Definir o contrato de persistência das notificações.
- Seguir o princípio de inversão de dependência.
- Permitir múltiplas implementações (Prisma, InMemory, etc.).

---

# 2. Método create()

O método recebe uma entidade Notification e não retorna nada.

```ts
abstract create(notification: Notification): Promise<void>
```

Exemplo de uso:

```ts
await notificationsRepository.create(notification)
```

---

# 3. Implementar o Service

O caso de uso é responsável por:

1. Criar a entidade.
2. Salvar no repositório.
3. Retornar a notificação criada.

```ts
export class SendNotificationUseCase {
  constructor(
    private notificationsRepository: NotificationsRepository,
  ) {}

  async execute({
    recipientId,
    title,
    content,
  }: SendNotificationUseCaseRequest) {
    const notification = Notification.create({
      recipientId,
      title,
      content,
    })

    await this.notificationsRepository.create(notification)

    return {
      notification,
    }
  }
}
```

Fluxo:

```text
Request
   ↓
Cria Notification
   ↓
Salva Repository
   ↓
Retorna Notification
```

---

# 4. Implementar InMemoryNotificationsRepository

Implementação utilizada nos testes.

```ts
export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async create(notification: Notification): Promise<void> {
    this.items.push(notification)
  }
}
```

Funcionamento:

```text
Antes

items = []

Após create()

items = [
  Notification
]
```

---

# 5. Implementar Teste Unitário

Verifica se a notificação foi criada e armazenada corretamente.

```ts
describe('Send Notification', () => {
  it('should be able to send a notification', async () => {
    const notificationsRepository =
      new InMemoryNotificationsRepository()

    const sut = new SendNotificationUseCase(
      notificationsRepository,
    )

    const result = await sut.execute({
      recipientId: '1',
      title: 'Nova resposta',
      content: 'Sua pergunta recebeu uma resposta',
    })

    expect(notificationsRepository.items).toHaveLength(1)

    expect(result.notification.title).toEqual(
      'Nova resposta',
    )
  })
})
```

O teste garante que:

- A entidade foi criada.
- O repositório recebeu a entidade.
- A notificação foi armazenada.
- O caso de uso retornou o resultado esperado.

---

# Resumo

```text
1. Criar NotificationsRepository
        ↓
2. Definir create(notification)
        ↓
3. Criar Notification no UseCase
        ↓
4. Salvar no Repository
        ↓
5. Implementar InMemoryRepository
        ↓
6. Criar teste unitário
        ↓
7. Validar persistência e retorno
```

Esse fluxo segue o padrão utilizado no curso para implementação de casos de uso utilizando DDD, entidades, repositórios e testes unitários.