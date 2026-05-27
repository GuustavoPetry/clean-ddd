import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { GetQuestionBySlug } from "./get-question-by-slug";
import { Question } from "../../enterprise/entities/question";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let sut: GetQuestionBySlug;

describe("Get Question By Slug", () => {
    beforeEach(() => {
        inMemoryQuestionRepository = new InMemoryQuestionRepository();
        sut = new GetQuestionBySlug(inMemoryQuestionRepository);
    });

    it("should be able to get a question by slug", async () => {
        const question = Question.create({
            title: "New Question",
            content: "New Content",
            slug: Slug.createFromText("Example Slug"),
            authorId: new UniqueEntityID("1")
        });

        inMemoryQuestionRepository.create(question);

        const getQuestionBySlug = await sut.execute({ slug: "example-slug" });

        console.log(getQuestionBySlug);

        expect(getQuestionBySlug.question).toBeInstanceOf(Question);
        expect(getQuestionBySlug.question.slug.value).toBe("example-slug");
    });
})