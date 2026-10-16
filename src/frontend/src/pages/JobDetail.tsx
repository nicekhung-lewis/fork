import { ConfirmCompletion } from "@/components/ConfirmCompletion";
import { OfferForm } from "@/components/OfferForm";
import { OfferList } from "@/components/OfferList";
import { StarRating } from "@/components/StarRating";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { useJobDetail, useJobOffers, usePublicProfile } from "@/hooks/use-jobs";
import { useMyOffers, useReviewsForUser } from "@/hooks/use-marketplace";
import { categoryIcon, categoryLabel } from "@/lib/categories";
import {
  formatBudgetRange,
  formatDurationDays,
  formatRelativeTime,
  formatThaiDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { JobStatus } from "@/types";
import type { Job, UserId } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarClock,
  ImageIcon,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

/** Gallery thumbnail that resolves its own blob URL. */
function GalleryImage({
  blob,
  alt,
  index,
  active,
  onSelect,
}: {
  blob: Uint8Array;
  alt: string;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const url = useBlobUrl(blob);
  if (!url) return null;
  return (
    <button
      type="button"
      data-ocid={`job_detail.gallery_thumb.${index}`}
      onClick={onSelect}
      aria-label={`ดูรูปที่ ${index}`}
      aria-pressed={active}
      className={cn(
        "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-accent"
          : "border-transparent opacity-70 hover:opacity-100",
      )}
    >
      <img src={url} alt={alt} className="h-full w-full object-cover" />
    </button>
  );
}

/** Owner summary card with avatar, rating, and completed-job count. */
function OwnerSummary({ owner }: { owner: UserId }) {
  const { data: publicProfile } = usePublicProfile(owner);
  const name = publicProfile?.profile.displayName?.trim() || "ผู้จ้างงาน";
  const stats = publicProfile?.stats;

  return (
    <div
      data-ocid="job_detail.owner_card"
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">ผู้จ้างงาน</p>
        <Link
          to="/profile/$principal"
          params={{ principal: owner.toText() }}
          data-ocid="job_detail.owner_link"
          className="block truncate font-display text-sm font-bold text-foreground hover:text-primary hover:underline"
        >
          {name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StarRating
            value={stats?.averageRating ?? 0}
            count={stats ? Number(stats.reviewCount) : undefined}
          />
          {stats && (
            <span className="text-xs text-muted-foreground nums-tabular">
              งานสำเร็จ {Number(stats.completedJobs)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div data-ocid="job_detail.loading_state" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

export function JobDetail() {
  const { id } = useParams({ strict: false }) as { id: string };
  const jobId = BigInt(id);
  const { principal } = useAuth();

  const { data: job, isLoading, isError, refetch } = useJobDetail(jobId);
  const isOwner = !!job && !!principal && job.owner.toText() === principal;

  // listOffersForJob is owner-only, so only the owner may run this query.
  const { data: ownerOffers = [] } = useJobOffers(jobId, { enabled: isOwner });
  // The accepted worker finds their own accepted offer among their own offers.
  const { data: myOffers = [] } = useMyOffers(null);

  const [activeImage, setActiveImage] = useState(0);

  const heroUrl = useBlobUrl(job?.images[activeImage]);

  const acceptedOffer = useMemo(() => {
    if (!job?.acceptedOfferId) return undefined;
    const pool = isOwner ? ownerOffers : myOffers;
    return pool.find((offer) => offer.id === job.acceptedOfferId);
  }, [job, isOwner, ownerOffers, myOffers]);

  const isAcceptedWorker =
    !!acceptedOffer &&
    !!principal &&
    acceptedOffer.worker.toText() === principal;
  const isParticipant = isOwner || isAcceptedWorker;

  // The other party in the job, for the completion panel and review heading.
  const otherPrincipal = isOwner
    ? (acceptedOffer?.worker ?? null)
    : (job?.owner ?? null);
  const { data: otherProfile } = usePublicProfile(otherPrincipal);
  const otherName = otherProfile?.profile.displayName?.trim()
    ? otherProfile.profile.displayName
    : "คู่สนทนา";

  const { data: otherReviews = [] } = useReviewsForUser(otherPrincipal);
  const hasReviewed =
    !!principal &&
    otherReviews.some(
      (review) =>
        review.jobId === jobId && review.author.toText() === principal,
    );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div
        data-ocid="job_detail.error_state"
        className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center"
      >
        <p className="font-display text-xl font-bold text-foreground">
          ไม่พบงานนี้
        </p>
        <p className="text-sm text-muted-foreground">
          งานอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="job_detail.retry_button"
            onClick={() => void refetch()}
            className="rounded-full"
          >
            ลองใหม่
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/" data-ocid="job_detail.back_button">
              กลับไปหน้าหลัก
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = categoryIcon(job.category);

  return (
    <div
      data-ocid="job_detail.page"
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <Link
        to="/"
        data-ocid="job_detail.back_link"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        กลับไปตลาดงาน
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <article className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle">
            <div className="relative aspect-[16/9] w-full bg-secondary">
              {heroUrl ? (
                <img
                  src={heroUrl}
                  alt={job.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10" aria-hidden="true" />
                </span>
              )}
              <div className="absolute left-4 top-4">
                <StatusBadge kind="job" status={job.status} />
              </div>
            </div>

            {job.images.length > 1 && (
              <div
                data-ocid="job_detail.gallery"
                className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3"
              >
                {job.images.map((blob, index) => (
                  <GalleryImage
                    key={`gallery-${blob.length}-${blob[0] ?? 0}-${blob[1] ?? 0}`}
                    blob={blob}
                    alt={`${job.title} รูปที่ ${index + 1}`}
                    index={index + 1}
                    active={index === activeImage}
                    onSelect={() => setActiveImage(index)}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-extrabold leading-tight text-foreground">
                  {job.title}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-display text-sm font-extrabold text-accent-foreground nums-tabular">
                  {formatBudgetRange(job.budget.min, job.budget.max)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {categoryLabel(job.category)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.location || "ไม่ระบุพื้นที่"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.dueDate
                    ? `ต้องการภายใน ${formatThaiDate(job.dueDate)}`
                    : "ไม่ระบุวันครบกำหนด"}
                </span>
                <span className="text-xs text-muted-foreground nums-tabular">
                  โพสต์ {formatRelativeTime(job.createdAt)}
                </span>
              </div>

              <div className="border-t border-border pt-4">
                <h2 className="mb-2 font-display text-sm font-bold text-foreground">
                  รายละเอียดงาน
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {job.description}
                </p>
              </div>
            </div>
          </article>

          {acceptedOffer && (
            <div
              data-ocid="job_detail.accepted_offer"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/25 bg-success/10 p-4"
            >
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  ผู้รับงานที่ได้รับเลือก
                </p>
                <p className="text-xs text-muted-foreground nums-tabular">
                  ราคา{" "}
                  {formatBudgetRange(acceptedOffer.price, acceptedOffer.price)}{" "}
                  · {formatDurationDays(acceptedOffer.durationDays)}
                </p>
              </div>
              <Button asChild className="rounded-full">
                <Link
                  to="/jobs/$id/chat"
                  params={{ id: job.id.toString() }}
                  data-ocid="job_detail.chat_button"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  เปิดแชท
                </Link>
              </Button>
            </div>
          )}

          {isParticipant &&
            (job.status === JobStatus.inProgress ||
              job.status === JobStatus.completed) && (
              <ConfirmCompletion
                job={job}
                viewer={principal}
                otherName={otherName}
                hasReviewed={hasReviewed}
              />
            )}

          {isOwner && (
            <section aria-label="ข้อเสนอ" className="flex flex-col gap-3">
              <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                ข้อเสนอที่ได้รับ
                <span className="nums-tabular text-sm font-semibold text-muted-foreground">
                  ({ownerOffers.length})
                </span>
              </h2>
              <OfferList job={job} offers={ownerOffers} viewer={principal} />
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <OwnerSummary owner={job.owner} />
          <OfferForm
            job={job}
            viewer={principal}
            offers={isOwner ? ownerOffers : myOffers}
          />
        </aside>
      </div>
    </div>
  );
}
