import { Either, left, rigth } from "@/core/either";
import { AnswerCommentRepository } from "../repositories/answer-comment-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface DeleteAnswerCommentServiceRequest {
    authorId: string,
    answerCommentId: string,
}

type DeleteAnswerCommentServiceResponse = Either<string, {}>

export class DeleteAnswerCommentService {
    constructor(private answerCommentRepo: AnswerCommentRepository) { }

    async execute({
        authorId,
        answerCommentId
    }: DeleteAnswerCommentServiceRequest): Promise<DeleteAnswerCommentServiceResponse> {
        const answerComment = await this.answerCommentRepo.findById(answerCommentId);

        if (!answerComment) return left("Resource not found.");

        const isAuthor = answerComment.authorId.toString() === authorId;

        if (!isAuthor) return left("User not authorized.");

        await this.answerCommentRepo.delete(answerComment);

        return rigth({});
    }
}