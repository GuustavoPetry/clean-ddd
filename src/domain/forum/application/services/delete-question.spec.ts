import { beforeEach, describe, expect, it } from "vitest";
import { DeleteQuestionService } from "./delete-question";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { InMemoryQuestionAttachmentRepository } from "../../../../../test/repositories/in-memory-question-attachment-repository";
import { makeQuestionAttachment } from "../../../../../test/factories/make-question-attachment";

let questionRepository: InMemoryQuestionRepository;
let attachmentRepository: InMemoryQuestionAttachmentRepository;
let sut: DeleteQuestionService;

describe("Delete Question", () => {
    beforeEach(() => {
        attachmentRepository = new InMemoryQuestionAttachmentRepository();
        questionRepository = new InMemoryQuestionRepository(attachmentRepository);
        sut = new DeleteQuestionService(questionRepository);
    });

    it("should be able delete a question", async () => {
        const question = makeQuestion(
            { authorId: new UniqueEntityID("author-1") },
            new UniqueEntityID("question-1")
        );

        await questionRepository.create(question);

        attachmentRepository.items.push(
            makeQuestionAttachment({
                questionId: question.id,
                attachmentId: new UniqueEntityID('1')
            }),
            makeQuestionAttachment({
                questionId: question.id,
                attachmentId: new UniqueEntityID('2')
            }),
        );

        const result = await sut.execute({
            id: "question-1",
            authorId: "author-1",
        });

        expect(result.isRigth()).toBe(true);
        expect(questionRepository.items).toHaveLength(0);
        expect(attachmentRepository.items).toHaveLength(0);
    });

    it("should not be able to delete a question from another user", async () => {
        const question = makeQuestion(
            { authorId: new UniqueEntityID("author-1") },
            new UniqueEntityID("question-1")
        );

        await questionRepository.create(question);

        const result = await sut.execute({
            id: "question-1",
            authorId: "another-user",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserNotAuthorizedError);
    });
});