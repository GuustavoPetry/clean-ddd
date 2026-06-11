import { Either, left, rigth } from "@/core/either";
import { Question } from "../../enterprise/entities/question";
import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";

interface GetQuestionBySlugRequest {
    slug: string,
}

type GetQuestionBySlugResponse = Either<
    ResourceNotFoundError,
    {
        question: Question,
    }
>

export class GetQuestionBySlug {
    constructor(private questionRepository: QuestionRepository) { }

    async execute({
        slug
    }: GetQuestionBySlugRequest): Promise<GetQuestionBySlugResponse> {
        const question = await this.questionRepository.getQuestionBySlug(slug);

        if (!question) return left(new ResourceNotFoundError());

        return rigth({
            question
        });
    }
}