import { Answer } from "../../enterprise/entities/answer";
import { AnswersRepository } from "../repositories/answer-repository";

interface FetchQuestionAnswerServiceRequest {
    questionId: string,
    page: number,
}

interface FetchQuestionAnswerServiceResponse {
    answers: Answer[]
}

export class FetchQuestionAnswerService {
    constructor(private answersRepository: AnswersRepository) { }

    async execute({
        questionId,
        page
    }: FetchQuestionAnswerServiceRequest): Promise<FetchQuestionAnswerServiceResponse> {
        const answers = await this.answersRepository.findManyByQuestionId(questionId, { page });

        return {
            answers,
        }
    }
}