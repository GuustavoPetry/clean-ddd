import { describe, it, beforeEach, expect } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { OnAnswerCreated } from "./on-answer-created";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";

let inMemoryAnswerRepository: InMemoryAnswerRepository;
let inMemoryAttachment: InMemoryAnswerAttachmentRepository;

describe("On Answer Created Event", () => {
    beforeEach(() => {
        inMemoryAttachment = new InMemoryAnswerAttachmentRepository();
        inMemoryAnswerRepository = new InMemoryAnswerRepository(inMemoryAttachment);
    });

    it("should be able to send a notification when created answer", async () => {
        new OnAnswerCreated();

        const answer = makeAnswer();

        expect(answer.domainEvents).toHaveLength(1);

        await inMemoryAnswerRepository.create(answer);

        expect(answer.domainEvents).toHaveLength(0);
    });
})