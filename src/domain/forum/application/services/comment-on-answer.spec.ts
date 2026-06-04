import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerCommentRepository } from "../../../../../test/repositories/in-memory-answer-comment-repository";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { CommentOnAnswerService } from "./comment-on-answer";

let inMemoryAnswer: InMemoryAnswerRepository;
let inMemoryAnswerComment: InMemoryAnswerCommentRepository;
let sut: CommentOnAnswerService;

describe("Comment on Answer", () => {
    beforeEach(() => {
        inMemoryAnswer = new InMemoryAnswerRepository();
        inMemoryAnswerComment = new InMemoryAnswerCommentRepository();
        sut = new CommentOnAnswerService(
            inMemoryAnswer,
            inMemoryAnswerComment
        );
    });

    it("should be able to create a comment on answer", async () => {
        const answer = makeAnswer();

        await inMemoryAnswer.create(answer);

        const result = await sut.execute({
            authorId: answer.authorId.toString(),
            answerId: answer.id.toString(),
            content: "New comment on answer"
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryAnswerComment.items[0]?.content).toEqual("New comment on answer");
    });
});