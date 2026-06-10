import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerCommentRepository } from "../../../../../test/repositories/in-memory-answer-comment-repository";
import { DeleteAnswerCommentService } from "./delete-answer-comment";
import { makeAnswerComment } from "../../../../../test/factories/make-answer-comment";

let inMemoryAnswerComment: InMemoryAnswerCommentRepository;
let sut: DeleteAnswerCommentService;

describe("Delete Answer Comment", () => {
    beforeEach(() => {
        inMemoryAnswerComment = new InMemoryAnswerCommentRepository();
        sut = new DeleteAnswerCommentService(inMemoryAnswerComment);
    });

    it("should be able to delete a answer comment", async () => {
        const comment = makeAnswerComment();

        await inMemoryAnswerComment.create(comment);

        const result = await sut.execute({
            authorId: comment.authorId.toString(),
            answerCommentId: comment.id.toString(),
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryAnswerComment.items).toHaveLength(0);
    });

    it("should not be able to delete a answer from another user", async () => {
        const comment = makeAnswerComment();

        await inMemoryAnswerComment.create(comment);

        const result = await sut.execute({
            authorId: "author-2",
            answerCommentId: comment.id.toString()
        });

        expect(result.isLeft()).toBe(true);
        expect(inMemoryAnswerComment.items).toHaveLength(1);
    })
});