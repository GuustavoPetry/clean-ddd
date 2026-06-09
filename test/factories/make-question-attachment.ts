import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { QuestionAttachmentProps, QuestionAttachments } from "@/domain/forum/enterprise/entities/question-attachments";

export function makeQuestionAttachment(
    override: Partial<QuestionAttachmentProps> = {},
    id?: UniqueEntityID
) {
    const questionAttachment = QuestionAttachments.create({
        attachmentId: new UniqueEntityID(),
        questionId: new UniqueEntityID(),
        ...override
    }, id);

    return questionAttachment;
}