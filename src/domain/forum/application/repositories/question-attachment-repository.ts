import { QuestionAttachments } from "../../enterprise/entities/question-attachments";

export interface QuestionAttachmentRepository {
    findManyByQuestionId(questionId: string): Promise<QuestionAttachments[]>;
}