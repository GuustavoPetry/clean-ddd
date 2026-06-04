import { Either, rigth } from "@/core/either";
import { QuestionComment } from "../../enterprise/entities/question-comment";
import { QuestionCommentRepository } from "../repositories/question-comment-repository";

interface FetchQuestionCommentsRequest {
    questionId: string,
    page: number,
}

type FetchQuestionCommentsResponse = Either<
    void,
    {
        questionComments: QuestionComment[]
    }
>

export class FetchQuestionCommentsService {
    constructor(private questionCommentsRepository: QuestionCommentRepository) { }

    async execute({
        questionId,
        page
    }: FetchQuestionCommentsRequest): Promise<FetchQuestionCommentsResponse> {
        const questionComments = await this.questionCommentsRepository.fetchByQuestionId(questionId, { page });

        return rigth({
            questionComments,
        });

    }
}