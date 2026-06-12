* [x] criar classe CustomAggregate -> representa agregado raiz da aplicação
* [x] criar static create() -> chamar addDomainEvent()

* [x] criar classe CustomAggregateCreate implementa DomainEvent -> identifica quando CustomAggregate foi criado
* [x] no construtor recebe CustomAggregate e define prop aggregate (private) + gerar data em ocurredAt
* [x] no metodo getAggregateId retornar o id do CustomAggregate
* [x] na classe CustomAggregate chamar addDomainEvent(new CustomAggregateCreated(aggregate))

* [] 