import { expect, it, beforeEach, describe } from "vitest";
import { CreateQuestionService } from "./create-question";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let sut: CreateQuestionService;

describe("Create Question", () => {
    beforeEach(() => {
        inMemoryQuestionRepository = new InMemoryQuestionRepository();
        sut = new CreateQuestionService(inMemoryQuestionRepository);
    });

    it("should be able to create a question", async () => {
        const result = await sut.execute({
            authorId: "ID",
            title: "Nova Pergunta",
            content: "Conteúdo da Pergunta",
            attachmentsIds: ["1", "2"]
        });

        console.log(inMemoryQuestionRepository.items[0]?.attachments);

        expect(result.isRigth()).toBe(true);
        expect(inMemoryQuestionRepository.items[0]).toEqual(result.value?.question);
        expect(inMemoryQuestionRepository.items[0]?.attachments).toHaveLength(2);
        expect(inMemoryQuestionRepository.items[0]?.attachments).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("2") })
        ])
    });
});

