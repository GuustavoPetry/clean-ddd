import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface AnswerProps {
    questionId: UniqueEntityID,
    authorId: UniqueEntityID,
    content: string,
    created_at: Date,
    updateAt?: Date
}

export class Answer extends Entity<AnswerProps> {
    get questionId() {
        return this.props.questionId;
    }

    get authorId() {
        return this.props.authorId;
    }

    get content() {
        return this.props.content;
    }

    get created_at() {
        return this.props.created_at;
    }

    get updateAt() {
        return this.props.updateAt;
    }

    get excerpt() {
        return this.content.substring(0, 120).trimEnd().concat("...");
    }

    private touch() {
        this.props.updateAt = new Date();
    }

    set content(content: string) {
        this.props.content = content;
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
