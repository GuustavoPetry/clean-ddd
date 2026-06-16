import { DomainEvents } from "@/core/events/domain-events";
import { EventHandler } from "@/core/events/event-handler";
import { AnswerCreatedEvents } from "../../../forum/enterprise/events/answer-created-events";
import { QuestionRepository } from "@/domain/forum/application/repositories/question-repository";
import { SendNotification } from "../services/send-notification";

export class OnAnswerCreated implements EventHandler {
    constructor(
        private questionRepository: QuestionRepository,
        private sendNotification: SendNotification,
    ) {
        this.setupSubscriptions();
    }

    setupSubscriptions(): void {
        DomainEvents.register(
            this.sendNewAnswerNotification.bind(this),
            AnswerCreatedEvents.name
        );

    }

    private async sendNewAnswerNotification({ answer }: AnswerCreatedEvents) {
        const question = await this.questionRepository.findById(answer.questionId.toString());

        if (question) {
            await this.sendNotification.execute({
                recipientId: question?.authorId.toString(),
                title: `Nova Resposta em "${question.title.substring(0, 40).concat("...")}"`,
                content: answer.excerpt,
            });
        }
    }
}