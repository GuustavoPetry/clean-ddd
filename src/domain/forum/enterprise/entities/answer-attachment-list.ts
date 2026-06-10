import { WatchedList } from "@/core/entities/watched-list";
import { AnswerAttachments } from "./answer-attachments";

export class AnswerAttachmentList extends WatchedList<AnswerAttachments> {
    compareItems(a: AnswerAttachments, b: AnswerAttachments): boolean {
        return a.answerId === b.answerId;
    }
}