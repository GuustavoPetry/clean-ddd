import { NotificationRepository } from "@/domain/notification/application/repositories/notification-repository";
import { Notification } from "@/domain/notification/enterprise/entities/notification";

export class InMemoryNotificationRepository implements NotificationRepository {
    public items: Notification[] = [];

    async create(notification: Notification): Promise<void> {
        this.items.push(notification);
    }

    async findById(id: string): Promise<Notification | null> {
        const notification = this.items.find(item => item.id.toString() === id);

        return notification ?? null;
    }

    async save(notification: Notification): Promise<void> {
        const itemIndex = this.items.findIndex(item => item.id === notification.id);

        this.items[itemIndex] = notification;
    }
}