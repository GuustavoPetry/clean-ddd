import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface AnswerAttachmentsProps {
    answerId: UniqueEntityID,
    attachmentId: UniqueEntityID,
}

export class AnswerAttachments extends Entity<AnswerAttachmentsProps> {
    get questionId() {
        return this.props.answerId;
    }

    get attachmentId() {
        return this.props.attachmentId;
    }

    get answerId() {
        return this.props.answerId;
    }

    static create(props: AnswerAttachmentsProps, id?: UniqueEntityID) {
        const answerAttachment = new AnswerAttachments(props, id);

        return answerAttachment;
    }
}