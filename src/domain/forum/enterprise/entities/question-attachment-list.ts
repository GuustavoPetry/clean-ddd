import { WatchedList } from "@/core/entities/watched-list";
import { QuestionAttachments } from "./question-attachments";

export class QuestionAttachmentList extends WatchedList<QuestionAttachments> {
    compareItems(a: QuestionAttachments, b: QuestionAttachments): boolean {
        return a.attachmentId.equals(b.attachmentId);
    }
}