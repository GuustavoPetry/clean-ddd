import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerComment } from "../../enterprise/entities/answer-comment";
import { AnswerCommentRepository } from "../repositories/answer-comment-repository";
import { AnswersRepository } from "../repositories/answer-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CommentOnAnswerServiceRequest {
    authorId: string,
    answerId: string,
    content: string,
}

interface CommentOnAnswerServiceResponse {
    answerComment: AnswerComment,
}

export class CommentOnAnswerService {
    constructor(
        private answerRepository: AnswersRepository,
        private answerCommentRepository: AnswerCommentRepository,
    ) { }

    async execute({
        authorId,
        answerId,
        content
    }: CommentOnAnswerServiceRequest): Promise<CommentOnAnswerServiceResponse> {
        const answer = this.answerRepository.findById(answerId);

        if (!answer) throw new ResourceNotFoundError();

        const answerComment = AnswerComment.create({
            authorId: new UniqueEntityID(authorId),
            answerId: new UniqueEntityID(answerId),
            content,
        });

        await this.answerCommentRepository.create(answerComment);

        return {
            answerComment,
        }
    }
}