import { JobForm } from "@/components/JobForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCreateJob } from "@/hooks/use-marketplace";
import type { JobDraft, JobUpdate } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, PlusCircle } from "lucide-react";
import { toast } from "sonner";

/** Create a new job post. Requires sign-in. */
export function JobNew() {
  const { isAuthenticated, isInitializing, login } = useAuth();
  const createJob = useCreateJob();
  const navigate = useNavigate();

  function handleSubmit(draft: JobDraft | JobUpdate) {
    createJob.mutate(draft as JobDraft, {
      onSuccess: (jobId) => {
        toast.success("โพสต์งานเรียบร้อยแล้ว");
        void navigate({
          to: "/jobs/$id",
          params: { id: jobId.toString() },
        });
      },
      onError: () => toast.error("โพสต์งานไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="job_new.auth_required"
        className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground">
          เข้าสู่ระบบเพื่อโพสต์งาน
        </h1>
        <p className="text-sm text-muted-foreground">
          ใช้ Internet Identity ในการเข้าสู่ระบบ ไม่ต้องตั้งรหัสผ่าน
        </p>
        <Button
          type="button"
          data-ocid="job_new.sign_in_button"
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
      data-ocid="job_new.page"
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            โพสต์งานใหม่
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            บอกรายละเอียดงานและงบประมาณ เพื่อให้ผู้รับงานส่งข้อเสนอเข้ามา
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-subtle sm:p-7">
        <JobForm
          onSubmit={handleSubmit}
          isSubmitting={createJob.isPending}
          submitLabel="โพสต์งาน"
        />
      </div>
    </div>
  );
}
