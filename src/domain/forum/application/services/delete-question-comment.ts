import { QuestionCommentRepository } from "../repositories/question-comment-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface DeleteQuestionCommentServiceRequest {
    authorId: string,
    questionCommentId: string,
}

interface DeleteQuestionCommentServiceResponse {

}

export class DeleteQuestionCommentService {
    constructor(private questionCommentRepo: QuestionCommentRepository) { }

    async execute({
        authorId,
        questionCommentId
    }: DeleteQuestionCommentServiceRequest): Promise<DeleteQuestionCommentServiceResponse> {
        const questionComment = await this.questionCommentRepo.findById(questionCommentId);

        if (!questionComment) throw new ResourceNotFoundError();

        const isAuthor = questionComment.authorId.toString() === authorId;

        if (!isAuthor) throw new UserNotAuthorizedError();

        await this.questionCommentRepo.delete(questionComment);

        return {}
    }
}