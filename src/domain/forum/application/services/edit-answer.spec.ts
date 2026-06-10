import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";
import { EditAnswerService } from "./edit-answer";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";
import { makeAnswerAttachment } from "../../../../../test/factories/make-answer-attachment";

let answerAttachmentRepository: InMemoryAnswerAttachmentRepository;
let inMemoryAnswerRepository: InMemoryAnswerRepository;
let inMemoryAnswerAttachments: InMemoryAnswerAttachmentRepository;
let sut: EditAnswerService;

describe("Edit ", () => {
    beforeEach(() => {
        answerAttachmentRepository = new InMemoryAnswerAttachmentRepository();
        inMemoryAnswerRepository = new InMemoryAnswerRepository(answerAttachmentRepository);
        inMemoryAnswerAttachments = new InMemoryAnswerAttachmentRepository();
        sut = new EditAnswerService(inMemoryAnswerRepository);
    });

    it("should be able to edit a answer", async () => {
        const newAnswer = makeAnswer({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("answer-1"));

        await inMemoryAnswerRepository.create(newAnswer);

        inMemoryAnswerAttachments.items.push(
            makeAnswerAttachment({
                answerId: newAnswer.id,
                attachmentId: new UniqueEntityID("1"),
            }),
            makeAnswerAttachment({
                answerId: newAnswer.id,
                attachmentId: new UniqueEntityID("2"),
            }),
        );
        console.log("items", inMemoryAnswerAttachments.items)

        const result = await sut.execute({
            authorId: "author-1",
            answerId: "answer-1",
            content: "New Content",
            attachmentIds: ["1", "3"]
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryAnswerRepository.items[0]).toMatchObject({
            content: "New Content",
        });
        expect(inMemoryAnswerRepository.items[0]?.attachments.currentItems).toHaveLength(2);
        expect(inMemoryAnswerRepository.items[0]?.attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("3") }),
        ]);
    });

    it("should not be able to edit a answer for another user", async () => {
        const answer = makeAnswer({
            authorId: new UniqueEntityID("author-1"),
            content: "Answer Content",
        }, new UniqueEntityID("answer-1"));

        await inMemoryAnswerRepository.create(answer);

        const result = await sut.execute({
            authorId: "author-2",
            answerId: "answer-1",
            content: "New Content",
            attachmentIds: []
        });

        expect(result.isLeft()).toBe(true);
        expect(inMemoryAnswerRepository.items[0]?.content).toBe("Answer Content");
    });
});