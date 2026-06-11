import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryNotificationRepository } from "../../../../../test/repositories/in-memory-notification-repository";
import { SendNotification } from "./send-notification";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryNotification: InMemoryNotificationRepository;
let sut: SendNotification;

describe("Send Notification", () => {
    beforeEach(() => {
        inMemoryNotification = new InMemoryNotificationRepository();
        sut = new SendNotification(inMemoryNotification);
    });

    it("should be able to send a notification", async () => {
        const result = await sut.execute({
            recipientId: new UniqueEntityID("user-1"),
            title: "notification title",
            content: "notification content"
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryNotification.items[0]).toEqual(result.value?.notification);
    });
})