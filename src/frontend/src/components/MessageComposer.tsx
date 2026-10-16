import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { type FormEvent, useState } from "react";

interface MessageComposerProps {
  /** Send the message; resolves when the mutation settles. */
  onSend: (body: string) => void;
  isSending: boolean;
  disabled?: boolean;
}

/**
 * Chat composer. Owns its draft locally, clears it synchronously on submit,
 * and restores it if the send fails so the user can retry.
 */
export function MessageComposer({
  onSend,
  isSending,
  disabled = false,
}: MessageComposerProps) {
  const [draft, setDraft] = useState("");

  const trimmed = draft.trim();
  const canSend = trimmed.length > 0 && !isSending && !disabled;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    const body = trimmed;
    setDraft("");
    onSend(body);
  }

  return (
    <form
      data-ocid="chat.composer"
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-border bg-card px-4 py-3 sm:px-6"
    >
      <Textarea
        data-ocid="chat.message_input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder="พิมพ์ข้อความ…"
        aria-label="ข้อความ"
        rows={1}
        disabled={disabled}
        className="max-h-32 min-h-10 flex-1 resize-none"
      />
      <Button
        type="submit"
        data-ocid="chat.send_button"
        disabled={!canSend}
        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">ส่ง</span>
      </Button>
    </form>
  );
}
