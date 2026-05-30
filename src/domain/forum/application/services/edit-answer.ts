import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { Answer } from "../../enterprise/entities/answer";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface EditAnswerServiceRequest {
    answerId: string,
    authorId: string,
    content: string,
}

interface EditAnswerServiceResponse {
    answer: Answer,
}

export class EditAnswerService {
    constructor(private repository: InMemoryAnswerRepository) { }

    async execute({
        answerId,
        authorId,
        content
    }: EditAnswerServiceRequest): Promise<EditAnswerServiceResponse> {
        const answer = await this.repository.findById(answerId);

        if (!answer) throw new ResourceNotFoundError();

        const isAuthor = answer.authorId.toString() === authorId;

        if(!isAuthor) throw new UserNotAuthorizedError();

        answer.content = content;

        this.repository.save(answer);

        return {
            answer,
        }
    }
}