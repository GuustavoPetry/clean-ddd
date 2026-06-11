import { Either, left, rigth } from "@/core/either";
import { InMemoryNotificationRepository } from "../../../../../test/repositories/in-memory-notification-repository";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { UserNotAuthorizedError } from "@/core/errors/errors/user-not-authorized-error";

interface ReadNotificationRequest {
    recipientId: string,
    notificationId: string,
}

type ReadNotificationResponse = Either<
    ResourceNotFoundError | UserNotAuthorizedError,
    {}
>

export class ReadNotification {
    constructor(private notificationRepository: InMemoryNotificationRepository) { }

    async execute({
        recipientId,
        notificationId,
    }: ReadNotificationRequest): Promise<ReadNotificationResponse> {
        const notification = await this.notificationRepository.findById(notificationId);

        if (!notification) return left(new ResourceNotFoundError());

        if (recipientId !== notification.recipientId.toString()) return left(new UserNotAuthorizedError());

        notification.read();

        await this.notificationRepository.save(notification);

        return rigth({});
    }
}