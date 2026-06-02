import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerComment, AnswerCommentProps } from "@/domain/forum/enterprise/entities/answer-comment";
import { faker } from "@faker-js/faker";

export function makeAnswerComment(
    override: Partial<AnswerCommentProps> = {},
    id?: UniqueEntityID
) {
    const answerComment = AnswerComment.create({
        authorId: new UniqueEntityID("author-1"),
        answerId: new UniqueEntityID("answer-1"),
        content: faker.lorem.sentence(),
        ...override
    }, id);

    return answerComment;
}