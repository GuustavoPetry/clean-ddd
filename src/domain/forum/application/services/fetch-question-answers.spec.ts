import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { FetchQuestionAnswerService } from "./fetch-question-answers";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";

let answerAttachmentRepository: InMemoryAnswerAttachmentRepository;
let inMemoryAnswers: InMemoryAnswerRepository;
let sut: FetchQuestionAnswerService;

describe("Fetch Question Answers", () => {
    beforeEach(() => {
        answerAttachmentRepository = new InMemoryAnswerAttachmentRepository();
        inMemoryAnswers = new InMemoryAnswerRepository(answerAttachmentRepository);
        sut = new FetchQuestionAnswerService(inMemoryAnswers);
    });

    it("should be able to fetch the answers of a question", async () => {
        await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));
        await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));
        await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));

        const result = await sut.execute({
            questionId: "question-1",
            page: 1
        });

        expect(result.isRigth()).toBe(true);
        expect(result.value?.answers).toHaveLength(3);
    });

    it("should be able to fetch paginated answers of a question", async () => {
        for (let i = 0; i < 22; i++) {
            await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));
        }

        const result = await sut.execute({
            questionId: "question-1",
            page: 2
        });

        expect(result.isRigth()).toBe(true);
        expect(result.value?.answers).toHaveLength(2);
    });
});