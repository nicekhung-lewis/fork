import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReviewDraft } from "@/types";
import { Loader2, Star } from "lucide-react";
import { type FormEvent, useState } from "react";

interface ReviewFormProps {
  /** Name of the person being reviewed, for the heading copy. */
  subjectName: string;
  onSubmit: (draft: ReviewDraft) => void;
  isSubmitting: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: "แย่มาก",
  2: "พอใช้",
  3: "ปานกลาง",
  4: "ดี",
  5: "ยอดเยี่ยม",
};

/** 1–5 star review form with a comment, shown after a job is completed. */
export function ReviewForm({
  subjectName,
  onSubmit,
  isSubmitting,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1) {
      setError("กรุณาเลือกคะแนน 1–5 ดาว");
      return;
    }
    setError(null);
    onSubmit({ rating: BigInt(rating), comment: comment.trim() });
  }

  const shown = hover || rating;

  return (
    <form
      data-ocid="review_form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label>ให้คะแนน {subjectName}</Label>
        <div
          data-ocid="review_form.rating_input"
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              data-ocid={`review_form.star.${star}`}
              aria-label={`ให้ ${star} ดาว`}
              aria-pressed={rating === star}
              onMouseEnter={() => setHover(star)}
              onClick={() => setRating(star)}
              className="rounded-md p-0.5 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-smooth",
                  star <= shown
                    ? "fill-accent text-accent"
                    : "fill-transparent text-muted-foreground/40",
                )}
                aria-hidden="true"
              />
            </button>
          ))}
          {shown > 0 && (
            <span className="ml-2 text-sm font-medium text-foreground">
              {RATING_LABELS[shown]}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="review-comment">ความคิดเห็น</Label>
        <Textarea
          id="review-comment"
          data-ocid="review_form.comment_textarea"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="เล่าประสบการณ์การทำงานร่วมกัน"
          rows={3}
        />
      </div>

      {error && (
        <p
          data-ocid="review_form.error_state"
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          data-ocid="review_form.submit_button"
          disabled={isSubmitting}
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          ส่งรีวิว
        </Button>
      </div>
    </form>
  );
}
