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
}