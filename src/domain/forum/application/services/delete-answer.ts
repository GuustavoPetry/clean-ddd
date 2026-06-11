import { Either, left, rigth } from "@/core/either";
import { AnswersRepository } from "../repositories/answer-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";

interface DeleteAnswerServiceRequest {
    id: string,
    authorId: string,
}

type DeleteAnswerServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {}
>

export class DeleteAnswerService {
    constructor(private repository: AnswersRepository) { }

    async execute({
        id,
        authorId
    }: DeleteAnswerServiceRequest): Promise<DeleteAnswerServiceResponse> {
        const findAnswer = await this.repository.findById(id);

        if (!findAnswer) return left(new ResourceNotFoundError());

        const isAuthor = findAnswer.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        await this.repository.delete(id);

        return rigth({});
    }
}