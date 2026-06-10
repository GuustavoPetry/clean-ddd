import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Answer } from "../../enterprise/entities/answer";
import { AnswersRepository } from "../repositories/answer-repository";
import { Either, rigth } from "@/core/either";
import { AnswerAttachments } from "../../enterprise/entities/answer-attachments";
import { AnswerAttachmentList } from "../../enterprise/entities/answer-attachment-list";

interface AnswerQuestionServiceRequest {
    instructorId: string,
    questionId: string,
    content: string,
    attachmentIds: string[],
}

type AnswerQuestionServiceResponse = Either<
    void,
    {
        answer: Answer,
    }
>

export class AnswerQuestionService {
    constructor(private answersRepository: AnswersRepository) { }

    async execute({
        instructorId,
        questionId,
        content,
        attachmentIds
    }: AnswerQuestionServiceRequest): Promise<AnswerQuestionServiceResponse> {
        const answer = Answer.create({
            content,
            authorId: new UniqueEntityID(instructorId),
            questionId: new UniqueEntityID(questionId)
        });

        const attachments = attachmentIds.map((attachmentId) => {
            return AnswerAttachments.create({
                answerId: answer.id,
                attachmentId: new UniqueEntityID(attachmentId)
            });
        });
        
        answer.attachments = new AnswerAttachmentList(attachments);
        
        await this.answersRepository.create(answer);

        return rigth({
            answer
        });
    }
}