import { AggregateRoot } from "../entities/aggregate-root";
import { UniqueEntityID } from "../entities/unique-entity-id";
import { DomainEvent } from "./domain-event";
import { expect, it, describe, vi } from "vitest";
import { DomainEvents } from "./domain-events";

class CustomAggregateCreated implements DomainEvent {
    public ocurredAt: Date;
    private aggregate: CustomAggregate;

    constructor(aggregate: CustomAggregate) {
        this.ocurredAt = new Date();
        this.aggregate = aggregate;
    }

    getAggregateId(): UniqueEntityID {
        return this.aggregate.id;
    }

}

class CustomAggregate extends AggregateRoot<null> {
    static create() {
        const aggregate = new CustomAggregate(null);

        aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

        return aggregate;
    }
}

describe("Domain Events", () => {
    it("should be able to dispatch and listen to events", () => {
        const callbackSpy = vi.fn();

        // Subcriber cadastrado (ouvindo evento de algo criado)
        DomainEvents.register(callbackSpy, CustomAggregateCreated.name);

        // Instanciando resposta, sem salvar no banco
        const aggregate = CustomAggregate.create();

        // Assegurando que o evento foi criado, mas não foi disparado
        expect(aggregate.domainEvents).toHaveLength(1);

        // Ao salvar no banco de dados -> dispara o evento
        DomainEvents.dispatchEventsForAggregate(aggregate.id);

        // O subscriber ouve o evento e faz o que precisa ser feito com o dado
        expect(callbackSpy).toHaveBeenCalled();
        expect(aggregate.domainEvents).toHaveLength(0);
    });
})