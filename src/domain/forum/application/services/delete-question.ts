import { QuestionRepository } from "../repositories/question-repository";

interface DeleQuestionServiceRequest {
    id: string,
    authorId: string,
}

interface DeleQuestionServiceResponse {}

export class DeleteQuestionService {
    constructor(private repository: QuestionRepository) {}

    async execute({
        id,
        authorId,
    }: DeleQuestionServiceRequest): Promise<DeleQuestionServiceResponse> {
        const findQuestion = await this.repository.findById(id);

        if (!findQuestion) throw new Error(`Question not found.`);

        const isAuthor = findQuestion.authorId.toString() === authorId;

        if (!isAuthor) throw new Error(`Unauthorized`);

        await this.repository.delete(id);

        return {}
    }
}