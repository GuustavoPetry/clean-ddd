import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryNotificationRepository } from "../../../../../test/repositories/in-memory-notification-repository";
import { ReadNotification } from "./read-notification";
import { makeNotification } from "../../../../../test/factories/make-notification";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";

let inMemoryNotification: InMemoryNotificationRepository;
let sut: ReadNotification;

describe("Read Notification", () => {
    beforeEach(() => {
        inMemoryNotification = new InMemoryNotificationRepository();
        sut = new ReadNotification(inMemoryNotification);
    });

    it("should be able to read a notification", async () => {
        const notification = makeNotification();

        await inMemoryNotification.create(notification);

        const result = await sut.execute({
            recipientId: notification.recipientId.toString(),
            notificationId: notification.id.toString(),
        });

        expect(result.isRigth()).toBe(true);
        expect(inMemoryNotification.items[0]?.readAt).toEqual(
            expect.any(Date),
        );
    });

    it("should not be able to read notification from another user", async () => {
        const notification = makeNotification();

        await inMemoryNotification.create(notification);

        const result = await sut.execute({
            recipientId: "another-user",
            notificationId: notification.id.toString(),
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(UserNotAuthorizedError);
    });
})