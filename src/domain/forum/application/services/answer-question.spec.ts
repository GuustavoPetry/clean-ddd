import { beforeEach, describe, expect, it } from "vitest";
import { AnswerQuestionService } from "./answer-question";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";

let answerAttachmentRepository: InMemoryAnswerAttachmentRepository;
let inMemoryAnswerRepository: InMemoryAnswerRepository;
let sut: AnswerQuestionService;

describe("Answer Question", () => {
    beforeEach(() => {
        answerAttachmentRepository = new InMemoryAnswerAttachmentRepository();
        inMemoryAnswerRepository = new InMemoryAnswerRepository(answerAttachmentRepository);
        sut = new AnswerQuestionService(inMemoryAnswerRepository);
    });

    it("should be able to create an answer", async () => {
        const result = await sut.execute({
            questionId: "1",
            instructorId: "1",
            content: "Nova Resposta",
            attachmentIds: ["1", "2"]
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryAnswerRepository.items[0]).toEqual(result.value?.answer);
        expect(inMemoryAnswerRepository.items[0]?.attachments.currentItems).toHaveLength(2);
        expect(inMemoryAnswerRepository.items[0]?.attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("2") }),
        ]);
    });
});
