import { AnswersRepository } from "../repositories/answer-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface DeleteAnswerServiceRequest {
    id: string,
    authorId: string,
}

interface DeleteAnswerServiceResponse { }

export class DeleteAnswerService {
    constructor(private repository: AnswersRepository) { }

    async execute({
        id,
        authorId
    }: DeleteAnswerServiceRequest): Promise<DeleteAnswerServiceResponse> {
        const findAnswer = await this.repository.findById(id);

        if (!findAnswer) throw new ResourceNotFoundError();

        const isAuthor = findAnswer.authorId.toString() === authorId;

        if (!isAuthor) throw new UserNotAuthorizedError();

        await this.repository.delete(id);

        return {}
    }
}