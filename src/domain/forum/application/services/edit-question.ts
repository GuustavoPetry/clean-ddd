import { Either, left, rigth } from "@/core/either";
import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface EditQuestionServiceRequest {
    authorId: string,
    questionId: string,
    title: string,
    content: string
}

type EditQuestionServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {}
>

export class EditQuestion {
    constructor(private repository: QuestionRepository) { }

    async execute({
        authorId,
        questionId,
        title,
        content
    }: EditQuestionServiceRequest): Promise<EditQuestionServiceResponse> {
        const question = await this.repository.findById(questionId);

        if (!question) return left(new ResourceNotFoundError());

        const isAuthor = question.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        question.title = title;
        question.content = content;

        await this.repository.save(question);

        return rigth({});
    }
}