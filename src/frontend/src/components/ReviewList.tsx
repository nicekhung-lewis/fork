import { StarRating } from "@/components/StarRating";
import { formatRelativeTime, shortPrincipal } from "@/lib/format";
import type { Review } from "@/types";
import { MessageSquareQuote } from "lucide-react";

interface ReviewListProps {
  reviews: Review[];
  /** Optional map of principal text → display name for nicer author labels. */
  names?: Record<string, string>;
}

/** Read-only list of reviews received by a user. */
export function ReviewList({ reviews, names }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div
        data-ocid="reviews.empty_state"
        className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-12 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <MessageSquareQuote className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-base font-bold text-foreground">
          ยังไม่มีรีวิว
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          เมื่อทำงานเสร็จและได้รับรีวิวจากคู่สัญญา รีวิวจะแสดงที่นี่
        </p>
      </div>
    );
  }

  return (
    <ul data-ocid="reviews.list" className="flex flex-col gap-3">
      {reviews.map((review, index) => {
        const authorText = review.author.toText();
        const authorName = names?.[authorText] ?? shortPrincipal(authorText);
        return (
          <li
            key={review.id.toString()}
            data-ocid={`reviews.item.${index + 1}`}
            className="rounded-xl border border-border bg-card p-4 shadow-subtle"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {authorName}
                </p>
                <p className="nums-tabular text-xs text-muted-foreground">
                  {formatRelativeTime(review.createdAt)}
                </p>
              </div>
              <StarRating value={Number(review.rating)} />
            </div>
            {review.comment.trim() && (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                {review.comment}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
