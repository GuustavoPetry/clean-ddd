import { DomainEvents } from "@/core/events/domain-events";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionAttachmentRepository } from "@/domain/forum/application/repositories/question-attachment-repository";
import { QuestionRepository } from "@/domain/forum/application/repositories/question-repository";
import { Question } from "@/domain/forum/enterprise/entities/question";

export class InMemoryQuestionRepository implements QuestionRepository {
    public items: Question[] = [];

    constructor(private attachmentRepository: QuestionAttachmentRepository) { }

    async create(question: Question) {
        this.items.push(question);

        DomainEvents.dispatchEventsForAggregate(question.id);
    }

    async getQuestionBySlug(slug: string) {
        const question = this.items.find(item => item.slug.value === slug);

        if (!question) return null;

        return question;
    }

    async findById(id: string) {
        const question = this.items.find(item => item.id.toString() === id);

        if (!question) {
            return null;
        }

        return question;
    }

    async findManyRecent({ page }: PaginationParams) {
        const questions = this.items
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .slice((page - 1) * 20, page * 20);

        return questions;
    }

    async save(question: Question) {
        const itemIndex = this.items.findIndex(item => item.id.toString() === question.id.toString());

        this.items[itemIndex] = question;

        DomainEvents.dispatchEventsForAggregate(question.id);
    }

    async delete(id: string) {
        const itemIndex = this.items.findIndex(item => item.id.toString() === id);

        this.items.splice(itemIndex);

        this.attachmentRepository.deleteManyByQuestionId(id);
    }
}