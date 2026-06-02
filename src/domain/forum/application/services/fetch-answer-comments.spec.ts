import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerCommentRepository } from "../../../../../test/repositories/in-memory-answer-comment-repository";
import { makeAnswerComment } from "../../../../../test/factories/make-answer-comment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { FetchAnswerCommentsService } from "./fetch-answer-comments";

let inMemoryAnswerComments: InMemoryAnswerCommentRepository;
let sut: FetchAnswerCommentsService;

describe("Fetch Answer Comments", () => {
    beforeEach(() => {
        inMemoryAnswerComments = new InMemoryAnswerCommentRepository();
        sut = new FetchAnswerCommentsService(inMemoryAnswerComments);
    });

    it("should be able to fetch answer comments filtering by answerId", async () => {
        for (let i = 0; i < 20; i++) {
            const comment = makeAnswerComment({ answerId: new UniqueEntityID("answer-1") });
            await inMemoryAnswerComments.create(comment);
        }

        const { answerComments } = await sut.execute({
            answerId: "answer-1",
            page: 1,
        });

        expect(answerComments).toHaveLength(20);
    });

    it("should be able to fetch paginated answer comments ", async () => {
        for (let i = 0; i < 22; i++) {
            const comment = makeAnswerComment({ answerId: new UniqueEntityID("answer-1") });
            await inMemoryAnswerComments.create(comment);
        }

        const { answerComments } = await sut.execute({
            answerId: "answer-1",
            page: 2,
        });

        expect(answerComments).toHaveLength(2);
    });
});