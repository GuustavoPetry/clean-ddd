import { Slug } from "./value-objects/slug";
import { Entity } from "../../core/entities/entity";
import { UniqueEntityID } from "../../core/entities/unique-entity-id";
import { Optional } from "../../core/types/optional";

interface QuestionProps {
    authorId: UniqueEntityID,
    bestAnswerId?: UniqueEntityID,
    title: string,
    content: string,
    slug: Slug,
    created_at: Date,
    updateAt?: Date
}

export class Question extends Entity<QuestionProps> {
    static create(
        props: Optional<QuestionProps, "created_at">,
        id?: UniqueEntityID
    ) {
        const question = new Question({
            ...props,
            created_at: new Date(),
        }, id);

        return question;
    }

}
