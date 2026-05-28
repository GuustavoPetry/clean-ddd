import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question, QuestionProps } from "@/domain/forum/enterprise/entities/question";
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug";

export function makeQuestion(override?: Partial<QuestionProps>) {
    const question = Question.create({
        title: "New Question",
        content: "New Question Content",
        slug: Slug.createFromText("New Question Slug"),
        authorId: new UniqueEntityID("ID TEST"),
        ...override,
    });

    return question;
}
