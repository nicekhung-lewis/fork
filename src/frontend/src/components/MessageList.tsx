import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { MessageSquare } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  /** Principal of the signed-in viewer, used to align their own bubbles. */
  viewer: string | null;
  /** Display name for the other participant, shown on their bubbles. */
  otherName: string;
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * Scrollable chat transcript. The viewer's own messages align right in the
 * brand indigo; the other party's align left on a paper surface.
 */
export function MessageList({ messages, viewer, otherName }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div
        data-ocid="chat.empty_state"
        className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-base font-bold text-foreground">
          ยังไม่มีข้อความ
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          เริ่มบทสนทนาเพื่อตกลงรายละเอียดของงานกับอีกฝ่ายได้เลย
        </p>
      </div>
    );
  }

  return (
    <ul
      data-ocid="chat.message_list"
      className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6"
    >
      {messages.map((message, index) => {
        const mine = viewer !== null && message.sender.toText() === viewer;
        return (
          <li
            key={message.id.toString()}
            data-ocid={`chat.message.${index + 1}`}
            className={cn(
              "flex items-end gap-2",
              mine ? "flex-row-reverse" : "flex-row",
            )}
          >
            {!mine && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                  {initials(otherName)}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "flex max-w-[78%] flex-col gap-1",
                mine ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  mine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm border border-border bg-card text-card-foreground",
                )}
              >
                {message.body}
              </div>
              <span className="nums-tabular px-1 text-[11px] text-muted-foreground">
                {formatRelativeTime(message.createdAt)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
