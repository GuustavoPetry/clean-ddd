import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { QuestionComment } from "../../enterprise/entities/question-comment";
import { QuestionCommentRepository } from "../repositories/question-comment-repository";
import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CommentOnQuestionServiceRequest {
    authorId: string,
    questionId: string,
    content: string,
}

interface CommentOnQuestionServiceResponse {
    questionComment: QuestionComment,
}

export class CommentOnQuestionService {
    constructor(
        private questionRepository: QuestionRepository,
        private questionCommentRepository: QuestionCommentRepository,
    ) { }

    async execute({
        authorId,
        questionId,
        content
    }: CommentOnQuestionServiceRequest): Promise<CommentOnQuestionServiceResponse> {
        const question = this.questionRepository.findById(questionId);

        if (!question) throw new ResourceNotFoundError();

        const questionComment = QuestionComment.create({
            authorId: new UniqueEntityID(authorId),
            questionId: new UniqueEntityID(questionId),
            content,
        });

        await this.questionCommentRepository.create(questionComment);

        return {
            questionComment,
        }
    }
}