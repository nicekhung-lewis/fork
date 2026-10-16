import { jobStatusMeta, offerStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { JobStatus, OfferStatus } from "@/types";

type StatusBadgeProps =
  | { kind: "job"; status: JobStatus; className?: string }
  | { kind: "offer"; status: OfferStatus; className?: string };

/**
 * Soft pill for a job or offer status. Colors come from the shared status
 * metadata so every surface renders the same Thai label and tone.
 */
export function StatusBadge(props: StatusBadgeProps) {
  const meta =
    props.kind === "job"
      ? jobStatusMeta(props.status)
      : offerStatusMeta(props.status);

  return (
    <span
      data-ocid={`status_badge.${props.kind}.${props.status}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        meta.className,
        props.className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
      />
      {meta.label}
    </span>
  );
}
