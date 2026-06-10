import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswerAttachmentRepository } from "@/domain/forum/application/repositories/answer-attachment-repository";
import { AnswersRepository } from "@/domain/forum/application/repositories/answer-repository";
import { Answer } from "@/domain/forum/enterprise/entities/answer";

export class InMemoryAnswerRepository implements AnswersRepository {
    public items: Answer[] = [];

    constructor(private answerAttachmentRepository: AnswerAttachmentRepository) { }

    async create(answer: Answer) {
        this.items.push(answer);
    }

    async save(answer: Answer) {
        const findIndex = this.items.findIndex(item => item.id.toString() === answer.id.toString());

        this.items[findIndex] = answer;
    }

    async findById(id: string): Promise<Answer | null> {
        const answer = this.items.find(item => item.id.toString() === id);

        if (!answer) return null;

        return answer;
    }

    async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
        const answers = this.items
            .filter(item => item.questionId.toString() === questionId)
            .slice((page - 1) * 20, page * 20);

        return answers;
    }

    async delete(id: string): Promise<void> {
        const index = this.items.findIndex(item => item.id.toString() === id);

        this.items.splice(index, 1);

        this.answerAttachmentRepository.deleteManyByAnswerId(id);
    }
}