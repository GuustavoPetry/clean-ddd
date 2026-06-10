# Subdomínios no Domain-Driven Design (DDD)

## Introdução

À medida que um sistema cresce, ele passa a possuir diversas áreas com responsabilidades diferentes.

Algumas dessas áreas são extremamente importantes para o negócio e representam o principal diferencial competitivo da empresa. Outras apenas dão suporte para que o negócio funcione, enquanto algumas são funcionalidades genéricas que praticamente toda aplicação possui.

O DDD propõe dividir o negócio em **Subdomínios**, permitindo identificar:

- O que realmente gera valor para a empresa;
- Onde investir mais tempo e recursos;
- Quais áreas precisam de mais atenção;
- O que pode ser simplificado ou até terceirizado.

---

# O que é um Subdomínio?

Um subdomínio é uma parte específica do domínio principal do negócio.

Por exemplo:

```text
Domínio: E-commerce

Subdomínios:
- Catálogo
- Compras
- Estoque
- Pagamentos
- Promoções
- Notificações
```

Cada um resolve um problema diferente dentro do negócio.

---

# Os 3 tipos de Subdomínio

No DDD normalmente classificamos os subdomínios em três categorias:

```text
Core Domain
Supporting Subdomain
Generic Subdomain
```

---

# Core Domain

## Definição

O Core Domain representa a parte mais importante do negócio.

É o que gera dinheiro.

É onde está o diferencial competitivo da empresa.

É a área que justifica a existência do sistema.

---

## Características

- Possui as regras mais importantes.
- Recebe a maior parte do investimento.
- Normalmente contém a maior complexidade.
- É difícil de copiar.
- Diferencia a empresa dos concorrentes.

---

## Pergunta para identificar

```text
Se essa funcionalidade deixar de existir,
a empresa continua ganhando dinheiro?
```

Se a resposta for não, provavelmente é um Core Domain.

---

# Supporting Subdomain

## Definição

São áreas que não geram dinheiro diretamente, mas permitem que o Core funcione corretamente.

Sem elas o negócio teria dificuldades para operar.

---

## Características

- Importantes para operação.
- Menor prioridade que o Core.
- Geralmente possuem regras de negócio específicas.
- Costumam depender do Core.

---

## Pergunta para identificar

```text
Isso gera dinheiro diretamente?
Não.

Mas o negócio consegue funcionar sem isso?
Também não.
```

Então provavelmente é um Supporting Subdomain.

---

# Generic Subdomain

## Definição

São funcionalidades necessárias, porém extremamente comuns.

Não representam diferencial competitivo.

Frequentemente podem ser compradas prontas ou terceirizadas.

---

## Características

- Pouca vantagem competitiva.
- Problemas já resolvidos pelo mercado.
- Muitas soluções prontas disponíveis.
- Menor prioridade de desenvolvimento.

---

## Pergunta para identificar

```text
Essa funcionalidade existe em praticamente
todo sistema?
```

Se sim, provavelmente é um Generic Subdomain.

---

# Exemplo Completo: E-commerce

Imagine que estamos construindo um sistema semelhante à Amazon.

---

## Core Domain

### Catálogo

Responsável por:

- Produtos
- Categorias
- Busca
- Recomendações

Exemplo:

```text
Notebook Dell
iPhone
Monitor Gamer
```

O catálogo é essencial porque o cliente precisa encontrar produtos para comprar.

---

### Compra

Responsável por:

- Carrinho
- Checkout
- Fechamento do pedido

Exemplo:

```text
Adicionar produto ao carrinho
Finalizar compra
Gerar pedido
```

Sem compras não existe faturamento.

---

### Pagamento

Responsável por:

- Cartão de crédito
- Pix
- Boleto
- Aprovação financeira

Exemplo:

```text
Pedido #123
Pagamento aprovado
```

Sem pagamento não existe receita.

---

### Entrega

Responsável por:

- Frete
- Transportadora
- Rastreamento

Exemplo:

```text
Pedido enviado
Pedido entregue
```

O produto precisa chegar ao cliente.

---

## Supporting Subdomain

### Estoque

Responsável por:

- Quantidade disponível
- Reserva de produtos
- Controle de reposição

Exemplo:

```text
Notebook Dell:
10 unidades
```

O estoque não gera dinheiro diretamente.

Quem gera dinheiro é a venda.

Mas sem estoque o processo de compra não funciona corretamente.

---

## Generic Subdomain

### Notificação ao Cliente

Exemplos:

```text
Pedido enviado
Pagamento aprovado
Pedido entregue
```

Praticamente todo sistema envia notificações.

---

### Promoções

Exemplos:

```text
Cupom de desconto
Black Friday
Frete grátis
```

Existem inúmeras soluções prontas para isso.

---

### Chat

Exemplos:

```text
Chat com vendedor
Chat com suporte
```

Funcionalidade comum em milhares de sistemas.

---

# Mapeando o E-commerce

```text
E-commerce
│
├── Core
│   ├── Catálogo
│   ├── Compra
│   ├── Pagamento
│   └── Entrega
│
├── Supporting
│   └── Estoque
│
└── Generic
    ├── Notificações
    ├── Promoções
    └── Chat
```

---

# Exemplo Aplicado ao Projeto Fórum

Durante o curso estamos desenvolvendo um Fórum.

Vamos aplicar exatamente o mesmo conceito.

---

# Core Domain do Fórum

O principal objetivo de um fórum é:

```text
Permitir que usuários façam perguntas
e recebam respostas.
```

Logo, tudo relacionado a isso pertence ao Core.

---

## Perguntas (Questions)

Responsável por:

- Criar pergunta
- Editar pergunta
- Buscar pergunta
- Listar perguntas

Exemplo:

```text
Como funciona Aggregate Root?
```

---

## Respostas (Answers)

Responsável por:

- Criar resposta
- Editar resposta
- Melhor resposta
- Excluir resposta

Exemplo:

```text
Aggregate Root é a entidade principal
de um agregado.
```

---

## Anexos

Responsável por:

- Upload
- Associação com perguntas
- Associação com respostas

Exemplo:

```text
Imagem
PDF
Arquivo
```

Como os anexos fazem parte do Aggregate de Question e Answer, eles pertencem ao Core.

---

## Ranking/Reputação

Caso exista:

```text
Pontuação
Curtidas
Melhor resposta
```

Também pode ser considerado Core.

---

# Supporting Subdomain do Fórum

São funcionalidades que ajudam o Core.

---

## Moderação

Responsável por:

- Denúncias
- Bloqueios
- Revisão de conteúdo

Exemplo:

```text
Resposta ofensiva
Pergunta inadequada
```

O fórum consegue gerar valor sem isso inicialmente.

Mas conforme cresce, a moderação se torna necessária.

---

## Controle de Usuários

Responsável por:

- Perfis
- Permissões
- Papéis

Exemplo:

```text
Aluno
Moderador
Administrador
```

Não é o objetivo principal do fórum, mas é importante para operação.

---

# Generic Subdomain do Fórum

São funcionalidades comuns que praticamente qualquer aplicação possui.

---

## Notificações

Exemplo:

```text
Sua pergunta recebeu uma resposta
```

---

## Chat

Exemplo:

```text
Mensagem privada
```

---

## E-mails

Exemplo:

```text
Recuperação de senha
```

---

## Autenticação

Exemplo:

```text
Login Google
Login GitHub
```

Embora seja essencial para o sistema funcionar, normalmente não é o diferencial do produto.

Muitas empresas utilizam serviços prontos para isso.

---

# Mapeando o Fórum

```text
Fórum
│
├── Core
│   ├── Perguntas
│   ├── Respostas
│   ├── Anexos
│   └── Reputação
│
├── Supporting
│   ├── Moderação
│   └── Gestão de Usuários
│
└── Generic
    ├── Notificações
    ├── Chat
    ├── E-mails
    └── Autenticação
```

---

# Por que isso é importante?

A principal vantagem dessa classificação é ajudar a direcionar esforço.

Por exemplo:

```text
Tempo disponível: 100 horas
```

Investimento recomendado:

```text
70 horas -> Core
20 horas -> Supporting
10 horas -> Generic
```

Não faz sentido gastar meses construindo um sistema de chat sofisticado se o principal fluxo de perguntas e respostas ainda não está funcionando bem.

---

# Resumo

Os subdomínios são uma forma de dividir o negócio em áreas menores e identificar quais delas são mais importantes.

Existem três tipos principais:

| Tipo | Objetivo |
|---------|---------|
| Core | Gera dinheiro e diferencia a empresa |
| Supporting | Dá suporte ao Core |
| Generic | Funcionalidades comuns e pouco estratégicas |

### E-commerce

```text
Core:
- Catálogo
- Compra
- Pagamento
- Entrega

Supporting:
- Estoque

Generic:
- Notificações
- Promoções
- Chat
```

### Fórum

```text
Core:
- Perguntas
- Respostas
- Anexos
- Reputação

Supporting:
- Moderação
- Gestão de Usuários

Generic:
- Notificações
- Chat
- E-mails
- Autenticação
```

Em DDD, a maior parte do esforço de modelagem, testes e regras de negócio deve estar concentrada nos **Core Domains**, pois é neles que está o verdadeiro valor do sistema.