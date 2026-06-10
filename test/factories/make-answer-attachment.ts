import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerAttachments, AnswerAttachmentsProps } from "@/domain/forum/enterprise/entities/answer-attachments";

export function makeAnswerAttachment(
    override: Partial<AnswerAttachmentsProps> = {},
    id?: UniqueEntityID
) {
    const answerAttachment = AnswerAttachments.create({
        answerId: new UniqueEntityID(),
        attachmentId: new UniqueEntityID(),
        ...override
    }, id);

    return answerAttachment;
}