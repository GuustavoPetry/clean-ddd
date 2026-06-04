import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionCommentRepository } from "../../../../../test/repositories/in-memory-question-comment-repository";
import { makeQuestionComment } from "../../../../../test/factories/make-question-comment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { FetchQuestionCommentsService } from "./fetch-question-comments";

let inMemoryQuestionComments: InMemoryQuestionCommentRepository;
let sut: FetchQuestionCommentsService;

describe("Fetch Question Comments", () => {
    beforeEach(() => {
        inMemoryQuestionComments = new InMemoryQuestionCommentRepository();
        sut = new FetchQuestionCommentsService(inMemoryQuestionComments);
    });

    it("should be able to fetch question comments filtering by questionId", async () => {
        for (let i = 0; i < 20; i++) {
            const comment = makeQuestionComment({ questionId: new UniqueEntityID("question-1") });
            await inMemoryQuestionComments.create(comment);
        }

        const result = await sut.execute({
            questionId: "question-1",
            page: 1,
        });

        expect(result.isRigth()).toBe(true);
        expect(result.value?.questionComments).toHaveLength(20);
    });

    it("should be able to fetch paginated question comments ", async () => {
        for (let i = 0; i < 22; i++) {
            const comment = makeQuestionComment({ questionId: new UniqueEntityID("question-1") });
            await inMemoryQuestionComments.create(comment);
        }

        const result = await sut.execute({
            questionId: "question-1",
            page: 2,
        });

        expect(result.isRigth()).toBe(true);
        expect(result.value?.questionComments).toHaveLength(2);
    });
});