import { Either, rigth } from "@/core/either";
import { Question } from "../../enterprise/entities/question";
import { QuestionRepository } from "../repositories/question-repository";

interface FetchRecentQuestionsServiceRequest {
    page: number
}

type FetchRecentQuestionsResponse = Either<
    void,
    {
        questions: Question[]
    }
>

export class FetchRecentQuestionsService {
    constructor(private questionRepository: QuestionRepository) { }

    async execute({
        page
    }: FetchRecentQuestionsServiceRequest): Promise<FetchRecentQuestionsResponse> {
        const questions = await this.questionRepository.findManyRecent({ page });

        return rigth({
            questions,
        });
    }
}