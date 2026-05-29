import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { DeleteAnswerService } from "./delete-answer";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

let repository: InMemoryAnswerRepository;
let sut: DeleteAnswerService;

describe("Delete Answer", () => {
    beforeEach(() => {
        repository = new InMemoryAnswerRepository();
        sut = new DeleteAnswerService(repository);
    });

    it("should be able to delete a answer", async () => {
        const answer = makeAnswer({
            authorId: new UniqueEntityID("author-1"),
        }, new UniqueEntityID("answer-1"));

        await repository.create(answer);

        await sut.execute({
            id: "answer-1",
            authorId: "author-1"
        });

        expect(repository.items).toHaveLength(0);
    });

    it("not should be able to delete a question for another user", async () => {
        const answer = makeAnswer({
            authorId: new UniqueEntityID("author-1"),
        }, new UniqueEntityID("answer-1"));

        await repository.create(answer);

        await expect(() =>
            sut.execute({
                id: "answer-1",
                authorId: "author-2"
            })).rejects.toBeInstanceOf(UserNotAuthorizedError);

    });
})