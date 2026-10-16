import { StatusBadge } from "@/components/StatusBadge";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { categoryIcon, categoryLabel } from "@/lib/categories";
import { formatBudgetRange, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";
import { Link } from "@tanstack/react-router";
import { ImageIcon, MapPin } from "lucide-react";

interface JobCardProps {
  job: Job;
  /** Numeric position for a stable deterministic test marker. */
  index: number;
}

/**
 * Dense feed card: thumbnail, title, category chip, coral budget pill,
 * location, relative time, and status badge. The whole card links to detail.
 */
export function JobCard({ job, index }: JobCardProps) {
  const Icon = categoryIcon(job.category);
  const thumbnail = useBlobUrl(job.images[0]);

  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id.toString() }}
      data-ocid={`job_card.item.${index}`}
      className={cn(
        "group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={job.title}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-foreground">
            {job.title}
          </h3>
          <StatusBadge kind="job" status={job.status} className="shrink-0" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {categoryLabel(job.category)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground nums-tabular">
            {formatBudgetRange(job.budget.min, job.budget.max)}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{job.location || "ไม่ระบุพื้นที่"}</span>
          </span>
          <span className="nums-tabular">
            {formatRelativeTime(job.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
