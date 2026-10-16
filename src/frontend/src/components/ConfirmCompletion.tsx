import { ReviewForm } from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { useConfirmCompletion, useLeaveReview } from "@/hooks/use-marketplace";
import { cn } from "@/lib/utils";
import type { Job, ReviewDraft } from "@/types";
import { JobStatus } from "@/types";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ConfirmCompletionProps {
  job: Job;
  /** Principal text of the signed-in viewer. */
  viewer: string | null;
  /** Display name of the other party, used in the review heading. */
  otherName: string;
  /** Whether the viewer has already left a review for this job. */
  hasReviewed: boolean;
}

/**
 * Completion panel for an in-progress job. Shows both parties' confirmation
 * state, lets the viewer confirm their side, and — once the job is completed —
 * offers the review form.
 */
export function ConfirmCompletion({
  job,
  viewer,
  otherName,
  hasReviewed,
}: ConfirmCompletionProps) {
  const confirm = useConfirmCompletion(job.id);
  const review = useLeaveReview(job.id);

  const isOwner = viewer !== null && job.owner.toText() === viewer;
  const viewerConfirmed = isOwner ? job.clientCompleted : job.workerCompleted;
  const otherConfirmed = isOwner ? job.workerCompleted : job.clientCompleted;
  const isCompleted = job.status === JobStatus.completed;

  function handleConfirm() {
    confirm.mutate(undefined, {
      onSuccess: () => toast.success("ยืนยันว่างานเสร็จเรียบร้อยแล้ว"),
      onError: () => toast.error("ยืนยันไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  function handleReview(draft: ReviewDraft) {
    review.mutate(draft, {
      onSuccess: () => toast.success("ขอบคุณสำหรับรีวิว"),
      onError: () => toast.error("ส่งรีวิวไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  return (
    <section
      data-ocid="completion.panel"
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-subtle"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-bold text-foreground">
          การยืนยันงานเสร็จ
        </h2>
        <p className="text-sm text-muted-foreground">
          ทั้งสองฝ่ายต้องกดยืนยันว่างานเสร็จ เมื่อครบทั้งสองฝ่ายงานจะเปลี่ยนเป็น “เสร็จแล้ว”
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        <ConfirmRow
          label={isOwner ? "คุณ (ผู้จ้างงาน)" : "ผู้จ้างงาน"}
          confirmed={job.clientCompleted}
        />
        <ConfirmRow
          label={isOwner ? "ผู้รับงาน" : "คุณ (ผู้รับงาน)"}
          confirmed={job.workerCompleted}
        />
      </ul>

      {!isCompleted && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            data-ocid="completion.confirm_button"
            disabled={viewerConfirmed || confirm.isPending}
            onClick={handleConfirm}
            className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
          >
            {confirm.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {viewerConfirmed ? "คุณยืนยันแล้ว รออีกฝ่าย" : "ยืนยันว่างานเสร็จ"}
          </Button>
          {otherConfirmed && !viewerConfirmed && (
            <p className="text-xs text-muted-foreground">
              อีกฝ่ายยืนยันแล้ว รอการยืนยันจากคุณ
            </p>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="flex flex-col gap-4 border-t border-border pt-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-bold text-foreground">
              รีวิวการทำงาน
            </h3>
            <p className="text-sm text-muted-foreground">
              ให้คะแนนและความคิดเห็นแก่ {otherName}
            </p>
          </div>
          {hasReviewed ? (
            <p
              data-ocid="completion.reviewed_state"
              className="rounded-md border border-success/25 bg-success/10 px-3 py-2 text-sm text-success"
            >
              คุณได้รีวิวงานนี้แล้ว ขอบคุณที่ช่วยให้ชุมชนน่าเชื่อถือ
            </p>
          ) : (
            <ReviewForm
              subjectName={otherName}
              onSubmit={handleReview}
              isSubmitting={review.isPending}
            />
          )}
        </div>
      )}
    </section>
  );
}

function ConfirmRow({
  label,
  confirmed,
}: { label: string; confirmed: boolean }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        confirmed
          ? "border-success/25 bg-success/10 text-success"
          : "border-border bg-secondary/40 text-muted-foreground",
      )}
    >
      {confirmed ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Circle className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs">
        {confirmed ? "ยืนยันแล้ว" : "รอยืนยัน"}
      </span>
    </li>
  );
}
