import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionCommentRepository } from "../../../../../test/repositories/in-memory-question-comment-repository";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { CommentOnQuestionService } from "./comment-on-question";

let inMemoryQuestion: InMemoryQuestionRepository;
let inMemoryQuestionComment: InMemoryQuestionCommentRepository;
let sut: CommentOnQuestionService;

describe("Comment on Question", () => {
    beforeEach(() => {
        inMemoryQuestion = new InMemoryQuestionRepository();
        inMemoryQuestionComment = new InMemoryQuestionCommentRepository();
        sut = new CommentOnQuestionService(
            inMemoryQuestion,
            inMemoryQuestionComment
        );
    });

    it("should be able to create a comment on question", async () => {
        const question = makeQuestion();

        const result = await sut.execute({
            authorId: question.authorId.toString(),
            questionId: question.id.toString(),
            content: "New comment on question"
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryQuestionComment.items[0]?.content).toEqual("New comment on question");
    });
});