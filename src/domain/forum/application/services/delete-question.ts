import { Either, left, rigth } from "@/core/either";
import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface DeleQuestionServiceRequest {
    id: string,
    authorId: string,
}

type DeleQuestionServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {}
>

export class DeleteQuestionService {
    constructor(private repository: QuestionRepository) { }

    async execute({
        id,
        authorId,
    }: DeleQuestionServiceRequest): Promise<DeleQuestionServiceResponse> {
        const findQuestion = await this.repository.findById(id);

        if (!findQuestion) return left(new ResourceNotFoundError());

        const isAuthor = findQuestion.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        await this.repository.delete(id);

        return rigth({});
    }
}