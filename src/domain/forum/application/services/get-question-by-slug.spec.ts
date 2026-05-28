import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { GetQuestionBySlug } from "./get-question-by-slug";
import { Question } from "../../enterprise/entities/question";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeQuestion } from "../../../../../test/factories/make-question";

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let sut: GetQuestionBySlug;

describe("Get Question By Slug", () => {
    beforeEach(() => {
        inMemoryQuestionRepository = new InMemoryQuestionRepository();
        sut = new GetQuestionBySlug(inMemoryQuestionRepository);
    });

    it("should be able to get a question by slug", async () => {
        const question = makeQuestion({
            slug: Slug.createFromText("Example Slug"),
        });

        inMemoryQuestionRepository.create(question);

        const getQuestionBySlug = await sut.execute({ slug: "example-slug" });

        expect(getQuestionBySlug.question).toBeInstanceOf(Question);
        expect(getQuestionBySlug.question.slug.value).toBe("example-slug");
    });
})