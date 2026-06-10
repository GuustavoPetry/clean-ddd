import { QuestionAttachmentRepository } from "@/domain/forum/application/repositories/question-attachment-repository";
import { QuestionAttachments } from "@/domain/forum/enterprise/entities/question-attachments";

export class InMemoryQuestionAttachmentRepository implements QuestionAttachmentRepository {
    public items: QuestionAttachments[] = [];

    async findManyByQuestionId(questionId: string): Promise<QuestionAttachments[]> {
        const attachments = this.items.filter(item => item.questionId.toString() === questionId);

        return attachments;
    }

    async deleteManyByQuestionId(questionId: string): Promise<void> {
        const attachments = this.items.filter((item) => item.questionId.toString() !== questionId);

        this.items = attachments;
    }
}