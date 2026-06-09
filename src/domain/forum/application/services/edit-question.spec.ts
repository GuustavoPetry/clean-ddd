import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { EditQuestion } from "./edit-question";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryQuestionAttachmentRepository } from "../../../../../test/repositories/in-memory-question-attachment-repository";
import { makeQuestionAttachment } from "../../../../../test/factories/make-question-attachment";

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let inMemoryQuestionAttachmentRepository: InMemoryQuestionAttachmentRepository;
let sut: EditQuestion;

describe("Edit Question", () => {
    beforeEach(() => {
        inMemoryQuestionRepository = new InMemoryQuestionRepository();
        inMemoryQuestionAttachmentRepository = new InMemoryQuestionAttachmentRepository();
        sut = new EditQuestion(
            inMemoryQuestionRepository,
            inMemoryQuestionAttachmentRepository
        );
    });

    it("should be able to edit a question", async () => {
        const newQuestion = makeQuestion({
            authorId: new UniqueEntityID("author-1")
        }, new UniqueEntityID("question-1"));

        inMemoryQuestionRepository.create(newQuestion);

        inMemoryQuestionAttachmentRepository.items.push(
            makeQuestionAttachment({
                attachmentId: new UniqueEntityID("1"),
                questionId: newQuestion.id,
            }),
            makeQuestionAttachment({
                attachmentId: new UniqueEntityID("2"),
                questionId: newQuestion.id,
            }),
        )

        const result = await sut.execute({
            authorId: "author-1",
            questionId: "question-1",
            title: "New Title",
            content: "New Content",
            attachmentIds: ["1", "3"],
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryQuestionRepository.items[0]).toMatchObject({
            title: "New Title",
            content: "New Content",
        });
        expect(inMemoryQuestionRepository.items[0]?.attachments.currentItems).toHaveLength(2);
        expect(inMemoryQuestionRepository.items[0]?.attachments.currentItems).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID("1") }),
            expect.objectContaining({ attachmentId: new UniqueEntityID("3") }),
        ]);
    });

    it("should not be able to edit a question for another user", async () => {
        const question = makeQuestion({
            authorId: new UniqueEntityID("author-1"),
            title: "Question Title",
            content: "Question Content",
        }, new UniqueEntityID("question-1"));

        await inMemoryQuestionRepository.create(question);

        const result = await sut.execute({
            authorId: "author-2",
            questionId: "question-1",
            title: "New Title",
            content: "New Content",
            attachmentIds: [],
        });

        expect(result.isLeft()).toBe(true);
        expect(inMemoryQuestionRepository.items[0]).toMatchObject({
            title: "Question Title",
            content: "Question Content",
        })
    });
});