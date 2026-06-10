import { AnswerAttachmentRepository } from "@/domain/forum/application/repositories/answer-attachment-repository";
import { AnswerAttachments } from "@/domain/forum/enterprise/entities/answer-attachments";

export class InMemoryAnswerAttachmentRepository implements AnswerAttachmentRepository {
    public items: AnswerAttachments[] = [];

    async findManyByAnswerId(answerId: string): Promise<AnswerAttachments[]> {
        const attachments = this.items.filter((item) => item.answerId.toString() === answerId);

        return attachments;
    }

    async deleteManyByAnswerId(answerId: string): Promise<void> {
        const attachments = this.items.filter((item) => item.answerId.toString() !== answerId);

        this.items = attachments;
    }


}