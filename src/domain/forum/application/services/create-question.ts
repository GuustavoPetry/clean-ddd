import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question } from "../../enterprise/entities/question";
import { QuestionRepository } from "../repositories/question-repository";
import { Either, rigth } from "@/core/either";

interface CreateQuestionServiceRequest {
    authorId: string,
    title: string,
    content: string,
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
        content
    }: CreateQuestionServiceRequest): Promise<CreateQuestionServiceResponse> {
        const question = Question.create({
            authorId: new UniqueEntityID(authorId),
            title,
            content
        });

        await this.questionRepository.create(question);

        return rigth({
            question,
        });
    }
}