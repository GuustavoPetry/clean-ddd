import { Either, left, rigth } from "@/core/either";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { Answer } from "../../enterprise/entities/answer";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";
import { AnswerAttachmentList } from "../../enterprise/entities/answer-attachment-list";
import { AnswerAttachments } from "../../enterprise/entities/answer-attachments";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface EditAnswerServiceRequest {
    answerId: string,
    authorId: string,
    content: string,
    attachmentIds: string[],
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
        content,
        attachmentIds
    }: EditAnswerServiceRequest): Promise<EditAnswerServiceResponse> {
        const answer = await this.repository.findById(answerId);

        if (!answer) return left(new ResourceNotFoundError());

        const isAuthor = answer.authorId.toString() === authorId;

        if (!isAuthor) return left(new UserNotAuthorizedError());

        const currentAttachments = answer.attachments.currentItems;

        const currentAttachmentList = new AnswerAttachmentList(currentAttachments);

        const newAttachments = attachmentIds.map((attachmentId) => {
            return AnswerAttachments.create({
                answerId: answer.id,
                attachmentId: new UniqueEntityID(attachmentId)
            });
        });

        currentAttachmentList.update(newAttachments);

        answer.content = content;
        answer.attachments = currentAttachmentList;

        this.repository.save(answer);

        return rigth({
            answer,
        });
    }
}