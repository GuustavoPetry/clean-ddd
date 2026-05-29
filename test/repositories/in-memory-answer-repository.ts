import { AnswersRepository } from "@/domain/forum/application/repositories/answer-repository";
import { Answer } from "@/domain/forum/enterprise/entities/answer";

export class InMemoryAnswerRepository implements AnswersRepository {
    public items: Answer[] = [];

    async create(answer: Answer) {
        this.items.push(answer);
    }

    async findById(id: string): Promise<Answer | null> {
        const answer = this.items.find(item => item.id.toString() === id);

        if(!answer) return null;

        return answer;
    }

    async delete(id: string): Promise<void> {
        const index = this.items.findIndex(item => item.id.toString() === id);

        this.items.splice(index, 1);
    }
}