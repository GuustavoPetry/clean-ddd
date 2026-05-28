import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question } from "../../enterprise/entities/question";
import { QuestionRepository } from "../repositories/question-repository";

interface CreateQuestionServiceRequest {
    authorId: string,
    title: string,
    content: string,
}

interface CreateQuestionServiceResponse {
    question: Question,
}

export class CreateQuestionService {
    constructor(private questionRepository: QuestionRepository) { }

    async execute({
        authorId,
        title,
        content
    }: CreateQuestionServiceRequest): Promise<CreateQuestionServiceResponse> {
        const question = Question.create({
            authorId: new UniqueEntityID(authorId),
            title,
            content
        });

        await this.questionRepository.create(question);

        return {
            question,
        }
    }
}