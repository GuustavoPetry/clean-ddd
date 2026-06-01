import { Question } from "../../enterprise/entities/question";
import { QuestionRepository } from "../repositories/question-repository";

interface FetchRecentQuestionsServiceRequest {
    page: number
}

interface FetchRecentQuestionsResponse {
    questions: Question[]
}

export class FetchRecentQuestionsService {
    constructor(private questionRepository: QuestionRepository) { }

    async execute({
        page
    }: FetchRecentQuestionsServiceRequest): Promise<FetchRecentQuestionsResponse> {
        const questions = await this.questionRepository.findManyRecent({ page });

        return {
            questions,
        }
    }
}