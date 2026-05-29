import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

interface EditQuestionServiceRequest {
    authorId: string,
    questionId: string,
    title: string,
    content: string
}

interface EditQuestionServiceResponse { }

export class EditQuestion {
    constructor(private repository: QuestionRepository) { }

    async execute({
        authorId,
        questionId,
        title,
        content
    }: EditQuestionServiceRequest): Promise<EditQuestionServiceResponse> { 
        const question = await this.repository.findById(questionId);

        if(!question) throw new ResourceNotFoundError();

        const isAuthor = question.authorId.toString() === authorId;

        if(!isAuthor) throw new UserNotAuthorizedError();

        question.title = title;
        question.content = content;
        
        await this.repository.save(question);

        return {}
    }
}