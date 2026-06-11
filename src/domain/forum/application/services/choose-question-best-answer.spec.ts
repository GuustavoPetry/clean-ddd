import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { ChooseQuestionBestAnswer } from "./choose-question-best-answer";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";
import { InMemoryQuestionAttachmentRepository } from "../../../../../test/repositories/in-memory-question-attachment-repository";

let questionAttachmentRepository: InMemoryQuestionAttachmentRepository;
let answerAttachmentRepository: InMemoryAnswerAttachmentRepository;
let inMemoryQuestionRepository: InMemoryQuestionRepository;
let inMemoryAnswerRepository: InMemoryAnswerRepository;
let sut: ChooseQuestionBestAnswer;

describe("Choose Question Best Answer", () => {
    beforeEach(() => {
        answerAttachmentRepository = new InMemoryAnswerAttachmentRepository();
        questionAttachmentRepository = new InMemoryQuestionAttachmentRepository();
        inMemoryQuestionRepository = new InMemoryQuestionRepository(questionAttachmentRepository);
        inMemoryAnswerRepository = new InMemoryAnswerRepository(answerAttachmentRepository);
        sut = new ChooseQuestionBestAnswer(
            inMemoryQuestionRepository,
            inMemoryAnswerRepository
        );
    });

    it("should be able to define a best answer for question", async () => {
        const question = makeQuestion();
        const answer = makeAnswer({ questionId: question.id });

        await inMemoryQuestionRepository.create(question);
        await inMemoryAnswerRepository.create(answer);

        const result = await sut.execute({
            authorId: question.authorId.toString(),
            answerId: answer.id.toString(),
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryQuestionRepository.items[0]?.bestAnswerId).toEqual(answer.id);
    });

    it("should not be able to define best answer if is not author", async () => {
        const question = makeQuestion({
            authorId: new UniqueEntityID("author-1"),
        });

        const answer = makeAnswer({ questionId: question.id }, new UniqueEntityID("answer-1"));

        await inMemoryQuestionRepository.create(question);
        await inMemoryAnswerRepository.create(answer);

        const result = await sut.execute({
            authorId: "author-2",
            answerId: "answer-1"
        })

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserNotAuthorizedError);
    });
});