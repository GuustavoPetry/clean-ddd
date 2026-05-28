import { Question } from "../../enterprise/entities/question";

export interface QuestionRepository {
    create(question: Question): Promise<void>;

    findById(id: string): Promise<Question | null>;

    delete(id: string): Promise<void>;

    getQuestionBySlug(slug: string): Promise<Question | null>;
}