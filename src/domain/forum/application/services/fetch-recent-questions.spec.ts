import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { FetchRecentQuestionsService } from "./fetch-recent-questions";
import { makeQuestion } from "../../../../../test/factories/make-question";

let inMemoryQuestions: InMemoryQuestionRepository;
let sut: FetchRecentQuestionsService;

describe("Fetch Recent Questions", () => {
    beforeEach(() => {
        inMemoryQuestions = new InMemoryQuestionRepository();
        sut = new FetchRecentQuestionsService(inMemoryQuestions);
    });

    it("should be able to fetch a recent questions", async () => {
        await inMemoryQuestions.create(makeQuestion({ created_at: new Date(2026, 0, 10) }));
        await inMemoryQuestions.create(makeQuestion({ created_at: new Date(2026, 0, 20) }));
        await inMemoryQuestions.create(makeQuestion({ created_at: new Date(2026, 0, 30) }));

        const { questions } = await sut.execute({ page: 1 });

        console.log(questions);

        expect(questions).toEqual([
            expect.objectContaining({created_at: new Date(2026, 0, 30)}),
            expect.objectContaining({created_at: new Date(2026, 0, 20)}),
            expect.objectContaining({created_at: new Date(2026, 0, 10)}),
        ])
    });

    it("should be able to fetch paginated recent questions", async () => {
        for(let i = 1; i < 23; i++) {
            await inMemoryQuestions.create(makeQuestion());
        }

        const {questions} = await sut.execute({
            page: 2
        });

        expect(questions).toHaveLength(2);
    });
});