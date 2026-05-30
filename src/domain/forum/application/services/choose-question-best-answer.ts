import { Question } from "../../enterprise/entities/question";
import { AnswersRepository } from "../repositories/answer-repository";
import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface ChooseQuestionBestAnswerServiceRequest {
    authorId: string,
    answerId: string,
}

interface ChooseQuestionBestAnswerServiceResponse {
    question: Question,
}

export class ChooseQuestionBestAnswer {
    constructor (
        private questionRepository: QuestionRepository,
        private answerRepository: AnswersRepository,
    ) {}

    async execute({
        authorId,
        answerId,
    }: ChooseQuestionBestAnswerServiceRequest): Promise<ChooseQuestionBestAnswerServiceResponse> {
        const answer = await this.answerRepository.findById(answerId);

        if (!answer) throw new ResourceNotFoundError();

        const question = await this.questionRepository.findById(answer.questionId.toString());

        if (!question) throw new ResourceNotFoundError();

        const isAuthor = question.authorId.toString() === authorId;

        if (!isAuthor) throw new UserNotAuthorizedError();

        question.bestAnswerId = answer.id;

        await this.questionRepository.save(question);

        return {
            question,
        }
    }
}