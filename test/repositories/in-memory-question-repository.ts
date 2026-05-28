import { QuestionRepository } from "@/domain/forum/application/repositories/question-repository";
import { Question } from "@/domain/forum/enterprise/entities/question";

export class InMemoryQuestionRepository implements QuestionRepository {
    public items: Question[] = [];

    async create(question: Question) {
        this.items.push(question);
    }

    async getQuestionBySlug(slug: string){
        const question = this.items.find(item => item.slug.value === slug);

        if (!question) return null;

        return question;
    }

    async findById(id: string){
        const question = this.items.find(item => item.id.toString() === id);

        if (!question) {
            return null;
        }

        return question;
    }

    async delete(id: string) {
        const itemIndex = this.items.findIndex(item => item.id.toString() === id);

        this.items.splice(itemIndex);
    }
}