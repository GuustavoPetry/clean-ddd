import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { ChooseQuestionBestAnswer } from "./choose-question-best-answer";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserNotAuthorizedError } from "./errors/user-not-authorized-error";

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let inMemoryAnswerRepository: InMemoryAnswerRepository;
let sut: ChooseQuestionBestAnswer;

describe("Choose Question Best Answer", () => {
    beforeEach(() => {
        inMemoryQuestionRepository = new InMemoryQuestionRepository();
        inMemoryAnswerRepository = new InMemoryAnswerRepository();
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

        await sut.execute({
            authorId: question.authorId.toString(),
            answerId: answer.id.toString(),
        });

        expect(question.bestAnswerId).toEqual(answer.id);
    });

    it("should not be able to define best answer if is not author", async () => {
        const question = makeQuestion({
            authorId: new UniqueEntityID("author-1"),
        });

        const answer = makeAnswer({ questionId: question.id }, new UniqueEntityID("answer-1"));

        await inMemoryQuestionRepository.create(question);
        await inMemoryAnswerRepository.create(answer);

        await expect(() =>
            sut.execute({
                authorId: "author-2",
                answerId: "answer-1"
            })
        ).rejects.toBeInstanceOf(UserNotAuthorizedError);
    });
});