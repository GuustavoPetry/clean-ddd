import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Answer } from "../../enterprise/entities/answer";
import { AnswersRepository } from "../repositories/answer-repository";

interface AnswerQuestionServiceRequest {
    instructorId: string,
    questionId: string,
    content: string,
}

interface AnswerQuestionServiceResponse {
    answer: Answer,
}

export class AnswerQuestionService {
    constructor(private answersRepository: AnswersRepository) { }

    async execute({
        instructorId,
        questionId,
        content
    }: AnswerQuestionServiceRequest): Promise<AnswerQuestionServiceResponse> {
        const answer = Answer.create({
            content,
            authorId: new UniqueEntityID(instructorId),
            questionId: new UniqueEntityID(questionId)
        });

        await this.answersRepository.create(answer);

        return { answer };
    }
}