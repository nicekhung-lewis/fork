import { MessageComposer } from "@/components/MessageComposer";
import { MessageList } from "@/components/MessageList";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useJobDetail, useJobOffers, usePublicProfile } from "@/hooks/use-jobs";
import {
  useMessages,
  useMyOffers,
  useSendMessage,
} from "@/hooks/use-marketplace";
import { shortPrincipal } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Lock, MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

/** In-job chat between the job owner and the accepted worker. */
export function JobChat() {
  const { id } = useParams({ from: "/jobs/$id/chat" });
  const { principal } = useAuth();

  const jobId = useMemo(() => {
    try {
      return BigInt(id);
    } catch {
      return null;
    }
  }, [id]);

  const { data: job, isLoading } = useJobDetail(jobId ?? 0n);
  const isOwner = !!job && !!principal && job.owner.toText() === principal;

  // listOffersForJob is owner-only, so only the owner may run this query.
  const { data: ownerOffers } = useJobOffers(jobId ?? 0n, { enabled: isOwner });
  // The accepted worker resolves themselves from their own offers instead.
  const { data: myOffers } = useMyOffers(null);
  const { data: messages } = useMessages(jobId ?? 0n);
  const sendMessage = useSendMessage(jobId ?? 0n);

  // The accepted worker is the author of the accepted offer.
  const workerPrincipal = useMemo(() => {
    if (!job || !job.acceptedOfferId) return null;
    if (isOwner) {
      const accepted = ownerOffers?.find(
        (offer) => offer.id === job.acceptedOfferId,
      );
      return accepted ? accepted.worker : null;
    }
    const mine = myOffers?.find((offer) => offer.id === job.acceptedOfferId);
    return mine ? mine.worker : null;
  }, [job, isOwner, ownerOffers, myOffers]);

  const isWorker =
    !!workerPrincipal && !!principal && workerPrincipal.toText() === principal;

  // The other participant's principal, for a friendly display name.
  const otherPrincipal = isOwner ? workerPrincipal : (job?.owner ?? null);

  const { data: otherProfile } = usePublicProfile(otherPrincipal);
  const otherName = otherProfile?.profile.displayName.trim()
    ? otherProfile.profile.displayName
    : otherPrincipal
      ? shortPrincipal(otherPrincipal.toText())
      : "คู่สนทนา";

  function handleSend(body: string) {
    sendMessage.mutate(body, {
      onError: () => toast.error("ส่งข้อความไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  if (isLoading) {
    return (
      <div
        data-ocid="chat.loading_state"
        className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8"
      >
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <ChatNotice
        icon={<MessageSquare className="h-7 w-7" aria-hidden="true" />}
        title="ไม่พบงานนี้"
        description="งานอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง"
      />
    );
  }

  // Only the owner and the accepted worker may view the thread.
  if (!isOwner && !isWorker) {
    return (
      <ChatNotice
        icon={<Lock className="h-7 w-7" aria-hidden="true" />}
        title="คุณไม่มีสิทธิ์เข้าดูแชทนี้"
        description="แชทภายในงานเปิดให้เฉพาะผู้จ้างงานและผู้รับงานที่ได้รับเลือกเท่านั้น"
      />
    );
  }

  return (
    <div
      data-ocid="chat.page"
      className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8"
    >
      <header className="mb-4 flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          data-ocid="chat.back_button"
          className="shrink-0 rounded-full"
        >
          <Link to="/jobs/$id" params={{ id: job.id.toString() }}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">กลับไปหน้ารายละเอียดงาน</span>
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold text-foreground">
            {job.title}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            แชทกับ {otherName}
          </p>
        </div>
        <StatusBadge kind="job" status={job.status} className="shrink-0" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-subtle">
        <MessageList
          messages={messages ?? []}
          viewer={principal}
          otherName={otherName}
        />
        <MessageComposer
          onSend={handleSend}
          isSending={sendMessage.isPending}
        />
      </div>
    </div>
  );
}

function ChatNotice({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      data-ocid="chat.notice_state"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        {icon}
      </span>
      <h1 className="font-display text-2xl font-bold text-foreground">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild className="rounded-full">
        <Link to="/" data-ocid="chat.home_button">
          กลับหน้าหลัก
        </Link>
      </Button>
    </div>
  );
}
