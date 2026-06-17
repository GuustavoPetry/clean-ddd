import { Either, rigth } from "@/core/either";
import { NotificationRepository } from "../repositories/notification-repository";
import { Notification } from "../../enterprise/entities/notification";

export interface SendNotificationRequest {
    recipientId: string,
    title: string,
    content: string,
}

export type SendNotificationResponse = Either<
    null,
    {
        notification: Notification
    }
>

export class SendNotification {
    constructor(private notificationRepository: NotificationRepository) { }

    async execute({
        recipientId,
        title,
        content
    }: SendNotificationRequest): Promise<SendNotificationResponse> {
        const notification = Notification.create({
            recipientId,
            title,
            content
        });

        await this.notificationRepository.create(notification);

        return rigth({
            notification,
        });
    }
}