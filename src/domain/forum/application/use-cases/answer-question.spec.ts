import { expect, test } from "vitest";
import { AnswerQuestionService } from "./answer-question";
import { AnswersRepository } from "../repositories/answer-repository";
import { Answer } from "../../enterprise/entities/answer";

const fakeAnswerRepository: AnswersRepository = {
    create: async (answer: Answer) => {
        return;
    }
}

test("create an answer", async () => {

    const answerQuestion = new AnswerQuestionService(fakeAnswerRepository);

    const answer = await answerQuestion.execute({
        questionId: "1",
        instructorId: "1",
        content: "Nova Resposta"
    });

    expect(answer.id.toString()).toEqual(expect.any(String));
    expect(answer.content).toEqual("Nova Resposta");
});