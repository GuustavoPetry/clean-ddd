import { beforeEach, describe, expect, it } from "vitest";
import { AnswerQuestionService } from "./answer-question";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";

let inMemoryAnswerRepository: InMemoryAnswerRepository;
let sut: AnswerQuestionService;

describe("Answer Question", () => {
    beforeEach(() => {
        inMemoryAnswerRepository = new InMemoryAnswerRepository();
        sut = new AnswerQuestionService(inMemoryAnswerRepository);
    });

    it("create an answer", async () => {
        const { answer } = await sut.execute({
            questionId: "1",
            instructorId: "1",
            content: "Nova Resposta"
        });

        expect(answer.id.toString()).toBeTruthy();
        expect(inMemoryAnswerRepository.items[0]?.id).toEqual(answer.id);
    });
});
