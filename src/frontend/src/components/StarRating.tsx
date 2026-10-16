import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  /** Rating from 0 to 5. Fractional values fill partial stars. */
  value: number;
  /** Number of reviews to show beside the stars, when known. */
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

const SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
} as const;

/**
 * Read-only 1–5 star display. Fills stars up to the rounded rating and shows
 * the numeric average plus review count when provided.
 */
export function StarRating({
  value,
  count,
  size = "sm",
  className,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const rounded = Math.round(clamped);

  return (
    <span
      data-ocid="star_rating"
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={`คะแนน ${clamped.toFixed(1)} จาก 5`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              SIZES[size],
              star <= rounded
                ? "fill-accent text-accent"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="nums-tabular text-xs font-semibold text-foreground">
        {clamped > 0 ? clamped.toFixed(1) : "—"}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </span>
  );
}
