import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";
import { EditAnswerService } from "./edit-answer";

let inMemoryRepository: InMemoryAnswerRepository;
let sut: EditAnswerService;

describe("Edit ", () => {
    beforeEach(() => {
        inMemoryRepository = new InMemoryAnswerRepository();
        sut = new EditAnswerService(inMemoryRepository);
    });

    it("should be able to edit a answer", async () => {
        const newAnswer = makeAnswer({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("answer-1"));

        inMemoryRepository.create(newAnswer);

        const result = await sut.execute({
            authorId: "author-1",
            answerId: "answer-1",
            content: "New Content",
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryRepository.items[0]).toMatchObject({
            content: "New Content",
        });
    });

    it("should not be able to edit a answer for another user", async () => {
        const answer = makeAnswer({
            authorId: new UniqueEntityID("author-1"),
            content: "Answer Content",
        }, new UniqueEntityID("answer-1"));

        await inMemoryRepository.create(answer);

        const result = await sut.execute({
            authorId: "author-2",
            answerId: "answer-1",
            content: "New Content"
        });

        expect(result.isLeft()).toBe(true);
        expect(inMemoryRepository.items[0]?.content).toBe("Answer Content");
    });
});