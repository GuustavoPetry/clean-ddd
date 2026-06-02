import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { QuestionComment, QuestionCommentProps } from "@/domain/forum/enterprise/entities/question-comment";
import { faker } from "@faker-js/faker";

export function makeQuestionComment(
    override: Partial<QuestionCommentProps> = {},
    id?: UniqueEntityID
) {
    const questionComment = QuestionComment.create({
        authorId: new UniqueEntityID("author-1"),
        questionId: new UniqueEntityID("question-1"),
        content: faker.lorem.sentence(),
        ...override
    }, id);

    return questionComment;
}