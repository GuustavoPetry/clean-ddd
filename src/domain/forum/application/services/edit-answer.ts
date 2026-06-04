import { Either, left, rigth } from "@/core/either";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { Answer } from "../../enterprise/entities/answer";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface EditAnswerServiceRequest {
    answerId: string,
    authorId: string,
    content: string,
}

type EditAnswerServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {
        answer: Answer,
    }
>

export class EditAnswerService {
    constructor(private repository: InMemoryAnswerRepository) { }

    async execute({
        answerId,
        authorId,
        content
    }: EditAnswerServiceRequest): Promise<EditAnswerServiceResponse> {
        const answer = await this.repository.findById(answerId);

        if (!answer) return left(new ResourceNotFoundError());

        const isAuthor = answer.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        answer.content = content;

        this.repository.save(answer);

        return rigth({
            answer,
        });
    }
}