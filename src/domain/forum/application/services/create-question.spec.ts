import { expect, it, beforeEach, describe } from "vitest";
import { CreateQuestionService } from "./create-question";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let sut: CreateQuestionService;

describe("Create Question", () => {
    beforeEach(() => {
        inMemoryQuestionRepository = new InMemoryQuestionRepository();
        sut = new CreateQuestionService(inMemoryQuestionRepository);
    });

    it("should be able to create a question", async () => {
        const { question } = await sut.execute({
            authorId: "ID",
            title: "Nova Pergunta",
            content: "Conteúdo da Pergunta"
        });

        expect(question.id).toBeTruthy();
        expect(inMemoryQuestionRepository.items[0]?.id).toEqual(question.id);
    });
});

