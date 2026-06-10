import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAnswerCommentRepository } from "../../../../../test/repositories/in-memory-answer-comment-repository";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { CommentOnAnswerService } from "./comment-on-answer";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";

let answerAttachmentRepository: InMemoryAnswerAttachmentRepository;
let inMemoryAnswer: InMemoryAnswerRepository;
let inMemoryAnswerComment: InMemoryAnswerCommentRepository;
let sut: CommentOnAnswerService;

describe("Comment on Answer", () => {
    beforeEach(() => {
        answerAttachmentRepository = new InMemoryAnswerAttachmentRepository();
        inMemoryAnswer = new InMemoryAnswerRepository(answerAttachmentRepository);
        inMemoryAnswerComment = new InMemoryAnswerCommentRepository();
        sut = new CommentOnAnswerService(
            inMemoryAnswer,
            inMemoryAnswerComment
        );
    });

    it("should be able to create a comment on answer", async () => {
        const answer = makeAnswer();

        const result = await sut.execute({
            authorId: answer.authorId.toString(),
            answerId: answer.id.toString(),
            content: "New comment on answer"
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryAnswerComment.items[0]?.content).toEqual("New comment on answer");
    });
});