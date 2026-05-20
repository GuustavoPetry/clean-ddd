import { Entity } from "../../core/entities/entity";
import { UniqueEntityID } from "../../core/entities/unique-entity-id";
import { Optional } from "../../core/types/optional";

interface AnswerProps {
    questionId: UniqueEntityID,
    authorId: UniqueEntityID,
    content: string,
    created_at: Date,
    updateAt?: Date
}

export class Answer extends Entity<AnswerProps> {
    get content() {
        return this.props.content;
    }

    static create(
        props: Optional<AnswerProps, "created_at">,
        id?: UniqueEntityID
    ) {
        const answer = new Answer({
            ...props,
            created_at: new Date(),
        }, id)

        return answer;
    }
}
