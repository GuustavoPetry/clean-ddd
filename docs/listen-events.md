#  Criar diretório notification/application/subscribers

# Criar classe subscribers/on-answer-created.ts que implementa EventHandler

# setupSubscriptions()
- Serve para registrar os eventos
- 1º argumento -> define qual função vai ser chamada no evento
- 2º argumento -> define o nome do evento

# Criar a função que será chamado no evento
- console log simples

# Nos métodos create e save do repositório
- chamar função dispatchEventsForAggregate

# Criar teste no subscriber
- it should be able to send a notification when an answer is created
- instanciar classe do subscriber -> construtor chama setupSubscriptions()
- criar uma answer e registrar no banco
- verificar se registrou log no terminal

