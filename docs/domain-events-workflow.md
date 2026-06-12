# Comunicação Publish/Subscriber (Pub/Sub)

Objetivo: permitir que diferentes partes do sistema se comuniquem sem criar dependências diretas entre elas.

---

# Problema do Acoplamento

Imagine o fluxo:

```text
Nova Resposta
      ↓
Enviar Notificação
```

O service de criação de respostas precisaria conhecer o service de notificações.

```text
Nova Resposta → Enviar Notificação
```

Consequências:

* Alto acoplamento.
* Difícil manutenção.
* Difícil adicionar novos comportamentos.
* Violação do princípio da responsabilidade única.

---

# Solução: Publish/Subscriber

Em vez de executar diretamente outra ação, o sistema apenas publica um evento.

```text
Nova Resposta
      ↓
Publica Evento
```

Quem tiver interesse nesse evento poderá reagir a ele.

```text
Nova Resposta
      ↓
Publish
      ↓
Subscriber
      ↓
Enviar Notificação
```

---

# Conceitos

## Publish

É o ato de informar ao sistema que algo aconteceu.

Exemplo:

```text
Uma resposta foi criada
```

O publisher não sabe quem utilizará essa informação.

---

## Subscriber

É quem escuta eventos e executa alguma ação.

Exemplo:

```text
Resposta criada
      ↓
Enviar notificação
```

Podem existir vários subscribers para o mesmo evento.

---

# Fluxo da Aula

## 1. Entidade cria um evento

Quando uma resposta é criada:

```ts
[
  {
    event: 'create-answer',
    answer: {},
    topic: {},
    ready: false,
  }
]
```

O evento é armazenado internamente na entidade.

O valor `ready: false` significa que o evento ainda não pode ser processado.

---

## 2. Repository salva os dados

Após a resposta ser persistida:

```text
Resposta salva no banco
```

O repository é responsável por liberar o evento.

---

## 3. Evento fica pronto

Após a persistência:

```ts
[
  {
    event: 'create-answer',
    answer: {},
    topic: {},
    ready: true,
  }
]
```

Agora o sistema sabe que a operação foi concluída com sucesso.

---

## 4. Subscriber executa ação

O subscriber recebe o evento:

```text
create-answer
      ↓
Enviar Notificação
```

Exemplo:

```ts
class OnAnswerCreatedSubscriber {
  execute(event: AnswerCreatedEvent) {
    sendNotification.execute(...)
  }
}
```

---

# Benefícios

## Sem Pub/Sub

```text
CreateAnswer
      ↓
SendNotification
      ↓
SendEmail
      ↓
GenerateLog
```

Cada nova funcionalidade aumenta o acoplamento.

---

## Com Pub/Sub

```text
CreateAnswer
      ↓
Publish Event
      ↓
├─ SendNotification
├─ SendEmail
└─ GenerateLog
```

O service de resposta não precisa conhecer nenhum desses processos.

---

# Resumo

```text
Resposta criada
      ↓
Publish Event
      ↓
Repository salva
      ↓
Evento ready = true
      ↓
Subscriber recebe
      ↓
Executa ações necessárias

Exemplo:
CreateAnswer
      ↓
AnswerCreatedEvent
      ↓
SendNotification
```

A principal vantagem do Publish/Subscriber é reduzir o acoplamento entre partes do sistema, permitindo que novas funcionalidades sejam adicionadas apenas criando novos subscribers, sem modificar o fluxo principal da aplicação.
