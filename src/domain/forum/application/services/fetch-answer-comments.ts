import { AnswerComment } from "../../enterprise/entities/answer-comment";
import { AnswerCommentRepository } from "../repositories/answer-comment-repository";

interface FetchAnswerCommentsRequest {
    answerId: string,
    page: number,
}

interface FetchAnswerCommentsResponse {
    answerComments: AnswerComment[]
}

export class FetchAnswerCommentsService {
    constructor(private answerCommentsRepository: AnswerCommentRepository) { }

    async execute({
        answerId,
        page
    }: FetchAnswerCommentsRequest): Promise<FetchAnswerCommentsResponse> {
        const answerComments = await this.answerCommentsRepository.fetchByAnswerId(answerId, { page });

        return {
            answerComments,
        };

    }
}