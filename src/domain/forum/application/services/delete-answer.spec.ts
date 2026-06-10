import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { DeleteAnswerService } from "./delete-answer";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";
import { makeAnswerAttachment } from "../../../../../test/factories/make-answer-attachment";

let answerRepository: InMemoryAnswerRepository;
let answerAttachmentRepository: InMemoryAnswerAttachmentRepository;
let sut: DeleteAnswerService;

describe("Delete Answer", () => {
    beforeEach(() => {
        answerAttachmentRepository = new InMemoryAnswerAttachmentRepository();
        answerRepository = new InMemoryAnswerRepository(answerAttachmentRepository);
        sut = new DeleteAnswerService(answerRepository);
    });

    it("should be able to delete a answer", async () => {
        const answer = makeAnswer({
            authorId: new UniqueEntityID("author-1"),
        }, new UniqueEntityID("answer-1"));

        await answerRepository.create(answer);

        answerAttachmentRepository.items.push(
            makeAnswerAttachment({
                answerId: answer.id,
                attachmentId: new UniqueEntityID("1")
            }),
            makeAnswerAttachment({
                answerId: answer.id,
                attachmentId: new UniqueEntityID("2")
            }),
        )

        const result = await sut.execute({
            id: "answer-1",
            authorId: "author-1"
        });

        expect(result.isRigth()).toBe(true);
        expect(answerRepository.items).toHaveLength(0);
        expect(answerAttachmentRepository.items).toHaveLength(0);
    });

    it("not should be able to delete a question for another user", async () => {
        const answer = makeAnswer({
            authorId: new UniqueEntityID("author-1"),
        }, new UniqueEntityID("answer-1"));

        await answerRepository.create(answer);

        const result = await sut.execute({
            id: "answer-1",
            authorId: "author-2"
        });

        expect(result.isLeft()).toBe(true);
        expect(answerRepository.items).toHaveLength(1);
    });
})