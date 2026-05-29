import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { DeleteQuestionService } from "./delete-question";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let repository: InMemoryQuestionRepository;
let sut: DeleteQuestionService;

describe("Delete Question", () => {
    beforeEach(() => {
        repository = new InMemoryQuestionRepository();
        sut = new DeleteQuestionService(repository);
    });

    it("should be able delete a question", async () => {
        const question = makeQuestion(
            { authorId: new UniqueEntityID("author-1") },
            new UniqueEntityID("question-1")
        );

        await repository.create(question);

        await sut.execute({
            id: "question-1",
            authorId: "author-1",
        });

        expect(repository.items).toHaveLength(0);
    });

    it("should not be able to delete a question from another user", async () => {
        const question = makeQuestion(
            { authorId: new UniqueEntityID("author-1") },
            new UniqueEntityID("question-1")
        );

        await repository.create(question);

        await expect(() =>
            sut.execute({
                id: "question-1",
                authorId: "another-user",
            })
        ).rejects.toBeInstanceOf(Error);
    });
});