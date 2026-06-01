import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { FetchQuestionAnswerService } from "./fetch-question-answers";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryAnswers: InMemoryAnswerRepository;
let sut: FetchQuestionAnswerService;

describe("Fetch Question Answers", () => {
    beforeEach(() => {
        inMemoryAnswers = new InMemoryAnswerRepository();
        sut = new FetchQuestionAnswerService(inMemoryAnswers);
    });

    it("should be able to fetch the answers of a question", async () => {
        await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));
        await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));
        await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));

        const { answers } = await sut.execute({
            questionId: "question-1",
            page: 1
        });

        expect(answers).toHaveLength(3);
    });

    it("should be able to fetch paginated answers of a question", async () => {
        for (let i = 0; i < 22; i++) {
            await inMemoryAnswers.create(makeAnswer({ questionId: new UniqueEntityID("question-1") }));
        }

        const { answers } = await sut.execute({
            questionId: "question-1",
            page: 2
        });

        expect(answers).toHaveLength(2);
    });
});