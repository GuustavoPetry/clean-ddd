import { Either, left, rigth } from "@/core/either";
import { QuestionRepository } from "../repositories/question-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";
import { QuestionAttachmentRepository } from "../repositories/question-attachment-repository";
import { QuestionAttachmentList } from "../../enterprise/entities/question-attachment-list";
import { QuestionAttachments } from "../../enterprise/entities/question-attachments";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface EditQuestionServiceRequest {
    authorId: string,
    questionId: string,
    title: string,
    content: string,
    attachmentIds: string[],
}

type EditQuestionServiceResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {}
>

export class EditQuestion {
    constructor(
        private questionRepository: QuestionRepository,
        private questionAttachmentRepository: QuestionAttachmentRepository,
    ) { }

    async execute({
        authorId,
        questionId,
        title,
        content,
        attachmentIds,
    }: EditQuestionServiceRequest): Promise<EditQuestionServiceResponse> {
        const question = await this.questionRepository.findById(questionId);

        if (!question) return left(new ResourceNotFoundError());

        const isAuthor = question.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        const currentAttachments = await this.questionAttachmentRepository.findManyByQuestionId(questionId);

        const attachmentList = new QuestionAttachmentList(currentAttachments);

        const newAttachmentList = attachmentIds.map((attachmentId) => {
            return QuestionAttachments.create({
                attachmentId: new UniqueEntityID(attachmentId),
                questionId: question.id,
            });
        });

        attachmentList.update(newAttachmentList);

        question.title = title;
        question.content = content;
        question.attachments = attachmentList;

        await this.questionRepository.save(question);

        return rigth({});
    }
}