import { NotificationRepository } from "@/domain/notification/application/repositories/notification-repository";
import { Notification } from "@/domain/notification/enterprise/entities/notification";

export class InMemoryNotificationRepository implements NotificationRepository {
    public items: Notification[] = [];

    async create(notification: Notification): Promise<void> {
        this.items.push(notification);
    }
}