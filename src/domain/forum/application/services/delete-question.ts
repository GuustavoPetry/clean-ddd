import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

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

        if (!findQuestion) throw new ResourceNotFoundError();

        const isAuthor = findQuestion.authorId.toString() === authorId;

        if (!isAuthor) throw new UserNotAuthorizedError();

        await this.repository.delete(id);

        return {}
    }
}