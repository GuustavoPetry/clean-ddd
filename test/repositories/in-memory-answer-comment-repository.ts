import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswerCommentRepository } from "@/domain/forum/application/repositories/answer-comment-repository";
import { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";

export class InMemoryAnswerCommentRepository implements AnswerCommentRepository {
    public items: AnswerComment[] = [];

    async create(answerComment: AnswerComment) {
        this.items.push(answerComment);
    }

    async findById(id: string) {
        const answerComment = this.items.find(item => item.id.toString() === id);

        if (!answerComment) return null;

        return answerComment;
    }

    async delete(answerComment: AnswerComment) {
        const itemIndex = this.items.findIndex(item => item.id === answerComment.id);

        this.items.splice(itemIndex, 1);
    }

    async fetchByAnswerId(answerId: string, { page }: PaginationParams): Promise<AnswerComment[]> {
        const answerComments = this.items
            .filter(item => item.answerId.toString() === answerId)
            .slice((page - 1) * 20, page * 20);

        return answerComments;
    }
}