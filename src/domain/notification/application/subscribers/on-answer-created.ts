import { DomainEvents } from "@/core/events/domain-events";
import { EventHandler } from "@/core/events/event-handler";
import { AnswerCreatedEvents } from "../../enterprise/events/answer-created-events";

export class OnAnswerCreated implements EventHandler {
    constructor() {
        this.setupSubscriptions();
    }

    setupSubscriptions(): void {
        DomainEvents.register(
            this.sendNewAnswerNotification.bind(this),
            AnswerCreatedEvents.name
        );

    }

    sendNewAnswerNotification({ answer }: AnswerCreatedEvents) {
        console.log("log", answer)
    }
}