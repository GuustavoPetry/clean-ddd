import { Either, left, rigth } from "@/core/either";
import { AnswerCommentRepository } from "../repositories/answer-comment-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";


interface DeleteAnswerCommentServiceRequest {
    authorId: string,
    answerCommentId: string,
}

type DeleteAnswerCommentServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {}
>

export class DeleteAnswerCommentService {
    constructor(private answerCommentRepo: AnswerCommentRepository) { }

    async execute({
        authorId,
        answerCommentId
    }: DeleteAnswerCommentServiceRequest): Promise<DeleteAnswerCommentServiceResponse> {
        const answerComment = await this.answerCommentRepo.findById(answerCommentId);

        if (!answerComment) return left(new ResourceNotFoundError());

        const isAuthor = answerComment.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError);

        await this.answerCommentRepo.delete(answerComment);

        return rigth({});
    }
}