import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { AnswerAttachmentList } from "./answer-attachment-list";
import { AggregateRoot } from "@/core/entities/aggregate-root";
import { AnswerCreatedEvents } from "@/domain/notification/enterprise/events/answer-created-events";

export interface AnswerProps {
    questionId: UniqueEntityID,
    authorId: UniqueEntityID,
    content: string,
    attachments: AnswerAttachmentList,
    created_at: Date,
    updateAt?: Date
}

export class Answer extends AggregateRoot<AnswerProps> {
    get questionId() {
        return this.props.questionId;
    }

    get authorId() {
        return this.props.authorId;
    }

    get content() {
        return this.props.content;
    }

    get attachments() {
        return this.props.attachments;
    }

    get created_at() {
        return this.props.created_at;
    }

    get updateAt() {
        return this.props.updateAt;
    }

    get excerpt() {
        return this.content.substring(0, 120).trimEnd().concat("...");
    }

    private touch() {
        this.props.updateAt = new Date();
    }

    set content(content: string) {
        this.props.content = content;
        this.touch();
    }

    set attachments(attachments: AnswerAttachmentList) {
        this.props.attachments = attachments;
        this.touch();
    }

    static create(
        props: Optional<AnswerProps, "created_at" | "attachments">,
        id?: UniqueEntityID
    ) {
        const answer = new Answer({
            ...props,
            attachments: props.attachments ?? new AnswerAttachmentList(),
            created_at: props.created_at ?? new Date(),
        }, id)

        const isNewAnswer = !id;

        if (isNewAnswer) {
            answer.addDomainEvent(new AnswerCreatedEvents(answer));
        }

        return answer;
    }
}
