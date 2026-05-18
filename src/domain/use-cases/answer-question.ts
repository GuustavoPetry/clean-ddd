import { Answer } from "../entities/answer";

interface AnswerQuestionServiceRequest {
    instructorId: string,
    questionId: string,
    content: string,
}

export class AnswerQuestionService {
    execute({
        instructorId, 
        questionId,
        content
    }: AnswerQuestionServiceRequest) {
        const answer = new Answer(content);

        return answer;
    }
}