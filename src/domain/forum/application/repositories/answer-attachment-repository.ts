import { AnswerAttachments } from "../../enterprise/entities/answer-attachments";

export interface AnswerAttachmentRepository {
    findManyByAnswerId(answerId: string): Promise<AnswerAttachments[]>;

    deleteManyByAnswerId(answerId: string): Promise<void>;
}