import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question } from "../../enterprise/entities/question";
import { QuestionRepository } from "../repositories/question-repository";
import { Either, rigth } from "@/core/either";
import { QuestionAttachments } from "../../enterprise/entities/question-attachments";

interface CreateQuestionServiceRequest {
    authorId: string,
    title: string,
    content: string,
    attachmentsIds: string[],
}

type CreateQuestionServiceResponse = Either<
    void,
    {
        question: Question,
    }
>

export class CreateQuestionService {
    constructor(private questionRepository: QuestionRepository) { }

    async execute({
        authorId,
        title,
        content,
        attachmentsIds,
    }: CreateQuestionServiceRequest): Promise<CreateQuestionServiceResponse> {
        const question = Question.create({
            authorId: new UniqueEntityID(authorId),
            title,
            content
        });

        const attachments = attachmentsIds.map(attachmentId => {
            return QuestionAttachments.create({
                attachmentId: new UniqueEntityID(attachmentId),
                questionId: question.id
            });
        });

        question.attachments = attachments;

        await this.questionRepository.create(question);

        return rigth({
            question,
        });
    }
}