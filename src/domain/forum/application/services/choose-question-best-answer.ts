import { Either, left, rigth } from "@/core/either";
import { Question } from "../../enterprise/entities/question";
import { AnswersRepository } from "../repositories/answer-repository";
import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface ChooseQuestionBestAnswerServiceRequest {
    authorId: string,
    answerId: string,
}

type ChooseQuestionBestAnswerServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {
        question: Question,
    }
>

export class ChooseQuestionBestAnswer {
    constructor(
        private questionRepository: QuestionRepository,
        private answerRepository: AnswersRepository,
    ) { }

    async execute({
        authorId,
        answerId,
    }: ChooseQuestionBestAnswerServiceRequest): Promise<ChooseQuestionBestAnswerServiceResponse> {
        const answer = await this.answerRepository.findById(answerId);

        if (!answer) return left(new ResourceNotFoundError());

        const question = await this.questionRepository.findById(answer.questionId.toString());

        if (!question) return left(new ResourceNotFoundError());

        const isAuthor = question.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        question.bestAnswerId = answer.id;

        await this.questionRepository.save(question);

        return rigth({
            question,
        });
    }
}