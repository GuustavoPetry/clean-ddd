import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { EditQuestion } from "./edit-question";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryRepository: InMemoryQuestionRepository;
let sut: EditQuestion;

describe("Edit Question", () => {
    beforeEach(() => {
        inMemoryRepository = new InMemoryQuestionRepository();
        sut = new EditQuestion(inMemoryRepository);
    });

    it("should be able to edit a question", async () => {
        const newQuestion = makeQuestion({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("question-1"));

        inMemoryRepository.create(newQuestion);

        await sut.execute({
            authorId: "author-1",
            questionId: "question-1",
            title: "New Title",
            content: "New Content",
        });

        expect(inMemoryRepository.items[0]).toMatchObject({
            title: "New Title",
            content: "New Content",
        });

    });
});