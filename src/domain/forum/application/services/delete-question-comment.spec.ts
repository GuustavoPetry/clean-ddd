import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionCommentRepository } from "../../../../../test/repositories/in-memory-question-comment-repository";
import { makeQuestionComment } from "../../../../../test/factories/make-question-comment";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";
import { DeleteQuestionCommentService } from "./delete-question-comment";

let inMemoryQuestionComment: InMemoryQuestionCommentRepository;
let sut: DeleteQuestionCommentService;

describe("Delete Question Comment", () => {
    beforeEach(() => {
        inMemoryQuestionComment = new InMemoryQuestionCommentRepository();
        sut = new DeleteQuestionCommentService(inMemoryQuestionComment);
    });

    it("should be able to delete a question comment", async () => {
        const comment = makeQuestionComment();

        await inMemoryQuestionComment.create(comment);

        const result = await sut.execute({
            authorId: comment.authorId.toString(),
            questionCommentId: comment.id.toString(),
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryQuestionComment.items).toHaveLength(0);
    });

    it("should not be able to delete a question from another user", async () => {
        const comment = makeQuestionComment();

        await inMemoryQuestionComment.create(comment);

        const result = await sut.execute({
            authorId: "author-2",
            questionCommentId: comment.id.toString()
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserNotAuthorizedError);
    });
});