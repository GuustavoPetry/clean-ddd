import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { GetQuestionBySlug } from "./get-question-by-slug";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { InMemoryQuestionAttachmentRepository } from "../../../../../test/repositories/in-memory-question-attachment-repository";

let questionAttachmentRepository: InMemoryQuestionAttachmentRepository;
let inMemoryQuestionRepository: InMemoryQuestionRepository;
let sut: GetQuestionBySlug;

describe("Get Question By Slug", () => {
    beforeEach(() => {
        questionAttachmentRepository = new InMemoryQuestionAttachmentRepository();
        inMemoryQuestionRepository = new InMemoryQuestionRepository(questionAttachmentRepository);
        sut = new GetQuestionBySlug(inMemoryQuestionRepository);
    });

    it("should be able to get a question by slug", async () => {
        const question = makeQuestion({
            slug: Slug.createFromText("Example Slug"),
        });

        inMemoryQuestionRepository.create(question);

        const result = await sut.execute({ slug: "example-slug" });

        expect(result.isRigth()).toBe(true);
        expect(result.value).toMatchObject({
            question: expect.objectContaining({
                title: question.title,
                slug: new Slug("example-slug")
            }),
        });
    });
})