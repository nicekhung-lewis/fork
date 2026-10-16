import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useMyOffers } from "@/hooks/use-marketplace";
import {
  formatBaht,
  formatDurationDays,
  formatRelativeTime,
} from "@/lib/format";
import type { Offer, OfferStatus } from "@/types";
import { OfferStatus as OfferStatusEnum } from "@/types";
import { Link } from "@tanstack/react-router";
import { FileText, LogIn, Timer } from "lucide-react";
import { useState } from "react";

const GROUPS: { status: OfferStatus; label: string }[] = [
  { status: OfferStatusEnum.pending, label: "รอพิจารณา" },
  { status: OfferStatusEnum.accepted, label: "ได้รับเลือก" },
  { status: OfferStatusEnum.rejected, label: "ไม่ได้รับเลือก" },
];

/** The signed-in user's submitted offers and their status. */
export function MyOffers() {
  const { isAuthenticated, isInitializing, login } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(OfferStatusEnum.pending);

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="my_offers.auth_required"
        className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground">
          เข้าสู่ระบบเพื่อดูข้อเสนอของฉัน
        </h1>
        <p className="text-sm text-muted-foreground">
          ติดตามสถานะข้อเสนอที่คุณส่งให้งานต่าง ๆ
        </p>
        <Button
          type="button"
          data-ocid="my_offers.sign_in_button"
          disabled={isInitializing}
          onClick={() => login()}
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isInitializing ? "กำลังโหลด…" : "เข้าสู่ระบบ"}
        </Button>
      </div>
    );
  }

  return (
    <div
      data-ocid="my_offers.page"
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          ข้อเสนอของฉัน
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ติดตามสถานะข้อเสนอที่คุณส่งไว้กับงานต่าง ๆ
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          data-ocid="my_offers.status_tabs"
          className="w-full sm:w-auto"
        >
          {GROUPS.map((group) => (
            <TabsTrigger
              key={group.status}
              value={group.status}
              data-ocid={`my_offers.tab.${group.status}`}
            >
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {GROUPS.map((group) => (
          <TabsContent key={group.status} value={group.status} className="mt-4">
            <OfferGroup status={group.status} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function OfferGroup({ status }: { status: OfferStatus }) {
  const { data: offers, isLoading, isError } = useMyOffers(status);

  if (isLoading) {
    return (
      <div data-ocid="my_offers.loading_state" className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => `offer-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-24 w-full rounded-xl" />
          ),
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <p
        data-ocid="my_offers.error_state"
        className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive"
      >
        โหลดรายการข้อเสนอไม่สำเร็จ กรุณาลองรีเฟรชหน้า
      </p>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div
        data-ocid="my_offers.empty_state"
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-14 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-base font-bold text-foreground">
          ยังไม่มีข้อเสนอในสถานะนี้
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          ค้นหางานที่สนใจแล้วส่งข้อเสนอ ข้อเสนอของคุณจะแสดงที่นี่
        </p>
        <Button
          asChild
          variant="outline"
          data-ocid="my_offers.browse_jobs_button"
          className="rounded-full"
        >
          <Link to="/">ค้นหางาน</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul data-ocid="my_offers.list" className="flex flex-col gap-3">
      {offers.map((offer, index) => (
        <OfferRow key={offer.id.toString()} offer={offer} index={index} />
      ))}
    </ul>
  );
}

function OfferRow({ offer, index }: { offer: Offer; index: number }) {
  return (
    <li
      data-ocid={`my_offers.item.${index + 1}`}
      className="rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to="/jobs/$id"
            params={{ id: offer.jobId.toString() }}
            data-ocid={`my_offers.job_link.${index + 1}`}
            className="font-display text-base font-bold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ดูรายละเอียดงาน #{offer.jobId.toString()}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge kind="offer" status={offer.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground nums-tabular">
              {formatBaht(offer.price)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              <Timer className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDurationDays(offer.durationDays)}
            </span>
          </div>
          {offer.message.trim() && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {offer.message}
            </p>
          )}
        </div>
        <span className="nums-tabular shrink-0 text-xs text-muted-foreground">
          {formatRelativeTime(offer.createdAt)}
        </span>
      </div>
    </li>
  );
}
