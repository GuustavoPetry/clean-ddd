import { Either, left, rigth } from "@/core/either";
import { QuestionCommentRepository } from "../repositories/question-comment-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";

interface DeleteQuestionCommentServiceRequest {
    authorId: string,
    questionCommentId: string,
}

type DeleteQuestionCommentServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {}
>

export class DeleteQuestionCommentService {
    constructor(private questionCommentRepo: QuestionCommentRepository) { }

    async execute({
        authorId,
        questionCommentId
    }: DeleteQuestionCommentServiceRequest): Promise<DeleteQuestionCommentServiceResponse> {
        const questionComment = await this.questionCommentRepo.findById(questionCommentId);

        if (!questionComment) return left(new ResourceNotFoundError());

        const isAuthor = questionComment.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        await this.questionCommentRepo.delete(questionComment);

        return rigth({});
    }
}