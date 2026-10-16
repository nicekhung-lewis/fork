import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAcceptOffer, usePublicProfile } from "@/hooks/use-jobs";
import {
  formatBaht,
  formatDurationDays,
  formatRelativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { type Job, JobStatus, type Offer, type UserId } from "@/types";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Inbox } from "lucide-react";
import { toast } from "sonner";

interface OfferListProps {
  job: Job;
  offers: Offer[];
  /** The caller's principal, or null when signed out. */
  viewer: string | null;
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

/** One offer row with the worker's public name and an optional accept action. */
function OfferRow({
  offer,
  index,
  canAccept,
  isAccepting,
  onAccept,
}: {
  offer: Offer;
  index: number;
  canAccept: boolean;
  isAccepting: boolean;
  onAccept: () => void;
}) {
  const { data: publicProfile } = usePublicProfile(offer.worker as UserId);
  const name = publicProfile?.profile.displayName?.trim() || "ผู้รับงาน";
  const principalText = offer.worker.toText();

  return (
    <li
      data-ocid={`offer_list.item.${index}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/profile/$principal"
              params={{ principal: principalText }}
              data-ocid={`offer_list.worker_link.${index}`}
              className="truncate font-display text-sm font-bold text-foreground hover:text-primary hover:underline"
            >
              {name}
            </Link>
            <StatusBadge kind="offer" status={offer.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground nums-tabular">
            {formatRelativeTime(offer.createdAt)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-extrabold text-accent nums-tabular">
            {formatBaht(offer.price)}
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatDurationDays(offer.durationDays)}
          </p>
        </div>
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {offer.message}
      </p>

      {canAccept && (
        <Button
          type="button"
          disabled={isAccepting}
          data-ocid={`offer_list.accept_button.${index}`}
          onClick={onAccept}
          className="self-start rounded-full"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {isAccepting ? "กำลังเลือก…" : "เลือกผู้รับงานคนนี้"}
        </Button>
      )}
    </li>
  );
}

/**
 * Offers received for a job. The job owner sees an accept action while the job
 * is still open; everyone else sees a read-only list.
 */
export function OfferList({ job, offers, viewer }: OfferListProps) {
  const acceptOffer = useAcceptOffer(job.id);
  const isOwner = viewer !== null && job.owner.toText() === viewer;
  const canAccept = isOwner && job.status === JobStatus.open;

  if (offers.length === 0) {
    return (
      <div
        data-ocid="offer_list.empty_state"
        className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-10 text-center"
      >
        <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-display text-sm font-bold text-foreground">
          ยังไม่มีข้อเสนอ
        </p>
        <p className="max-w-xs text-xs text-muted-foreground">
          เมื่อมีผู้รับงานสนใจ ข้อเสนอของพวกเขาจะแสดงที่นี่
        </p>
      </div>
    );
  }

  return (
    <ul
      data-ocid="offer_list.list"
      className={cn("flex flex-col gap-3")}
      aria-label="รายการข้อเสนอ"
    >
      {offers.map((offer, index) => (
        <OfferRow
          key={offer.id.toString()}
          offer={offer}
          index={index + 1}
          canAccept={canAccept}
          isAccepting={acceptOffer.isPending}
          onAccept={() =>
            acceptOffer.mutate(offer.id, {
              onSuccess: () => {
                toast.success("เลือกผู้รับงานแล้ว", {
                  description: "งานนี้เปลี่ยนเป็นสถานะกำลังทำ",
                });
              },
              onError: () => {
                toast.error("เลือกผู้รับงานไม่สำเร็จ", {
                  description: "กรุณาลองใหม่อีกครั้ง",
                });
              },
            })
          }
        />
      ))}
    </ul>
  );
}
