import { describe, it, beforeEach, expect, vi, MockInstance } from "vitest";
import { InMemoryAnswerRepository } from "../../../../../test/repositories/in-memory-answer-repository";
import { InMemoryAnswerAttachmentRepository } from "../../../../../test/repositories/in-memory-answer-attachment-repository";
import { makeAnswer } from "../../../../../test/factories/make-answer";
import { InMemoryQuestionRepository } from "../../../../../test/repositories/in-memory-question-repository";
import { InMemoryQuestionAttachmentRepository } from "../../../../../test/repositories/in-memory-question-attachment-repository";
import { SendNotification, SendNotificationRequest, SendNotificationResponse } from "../services/send-notification";
import { InMemoryNotificationRepository } from "../../../../../test/repositories/in-memory-notification-repository";
import { makeQuestion } from "../../../../../test/factories/make-question";
import { waitFor } from "../../../../../test/utils/wait-for";
import { OnQuestionBestAnswerChosen } from "./on-question-best-answer-chosen";

let inMemoryQuestionRepository: InMemoryQuestionRepository;
let inMemoryQuestionAttachment: InMemoryQuestionAttachmentRepository;
let inMemoryAnswerRepository: InMemoryAnswerRepository;
let inMemoryAttachment: InMemoryAnswerAttachmentRepository;
let sendNotificationService: SendNotification;
let InMemoryNotification: InMemoryNotificationRepository;

let sendNotificationExecuteSpy: MockInstance<
    (request: SendNotificationRequest) => Promise<SendNotificationResponse>
>;

describe("On Question Best Answer", () => {
    beforeEach(() => {
        inMemoryQuestionAttachment = new InMemoryQuestionAttachmentRepository();
        inMemoryQuestionRepository = new InMemoryQuestionRepository(inMemoryQuestionAttachment);
        inMemoryAttachment = new InMemoryAnswerAttachmentRepository();
        inMemoryAnswerRepository = new InMemoryAnswerRepository(inMemoryAttachment);
        InMemoryNotification = new InMemoryNotificationRepository();
        sendNotificationService = new SendNotification(InMemoryNotification);

        sendNotificationExecuteSpy = vi.spyOn(sendNotificationService, "execute");

        new OnQuestionBestAnswerChosen(
            inMemoryAnswerRepository,
            sendNotificationService
        );
    });

    it("should send a notification when question has new best answer chosen", async () => {
        const question = makeQuestion();
        const answer = makeAnswer({
            questionId: question.id
        })

        await inMemoryQuestionRepository.create(question);

        expect(answer.domainEvents).toHaveLength(1);

        await inMemoryAnswerRepository.create(answer);

        question.bestAnswerId = answer.id;

        inMemoryQuestionRepository.save(question);

        await waitFor(() => {
            expect(sendNotificationExecuteSpy).toHaveBeenCalled();
            expect(answer.domainEvents).toHaveLength(0);
        });
    });
})