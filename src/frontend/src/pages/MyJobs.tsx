import { JobForm } from "@/components/JobForm";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  useCloseJob,
  useDeleteJob,
  useMyJobs,
  useUpdateJob,
} from "@/hooks/use-marketplace";
import { categoryLabel } from "@/lib/categories";
import { formatBudgetRange, formatRelativeTime } from "@/lib/format";
import type { Job, JobStatus, JobUpdate } from "@/types";
import { JobStatus as JobStatusEnum } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  LogIn,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GROUPS: { status: JobStatus; label: string }[] = [
  { status: JobStatusEnum.open, label: "เปิดรับข้อเสนอ" },
  { status: JobStatusEnum.inProgress, label: "กำลังทำ" },
  { status: JobStatusEnum.completed, label: "เสร็จแล้ว" },
];

/** The signed-in user's posted jobs, grouped by status. */
export function MyJobs() {
  const { isAuthenticated, isInitializing, login } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(JobStatusEnum.open);

  if (!isAuthenticated) {
    return (
      <AuthGate
        title="เข้าสู่ระบบเพื่อดูงานของฉัน"
        description="จัดการงานที่คุณโพสต์ไว้ได้ในที่เดียว"
        isInitializing={isInitializing}
        onLogin={login}
        ocid="my_jobs"
      />
    );
  }

  return (
    <div
      data-ocid="my_jobs.page"
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            งานของฉัน
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ดูข้อเสนอ แก้ไข ปิด หรือลบงานที่คุณโพสต์ไว้
          </p>
        </div>
        <Button
          asChild
          data-ocid="my_jobs.post_job_button"
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link to="/jobs/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            โพสต์งานใหม่
          </Link>
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-ocid="my_jobs.status_tabs" className="w-full sm:w-auto">
          {GROUPS.map((group) => (
            <TabsTrigger
              key={group.status}
              value={group.status}
              data-ocid={`my_jobs.tab.${group.status}`}
            >
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {GROUPS.map((group) => (
          <TabsContent key={group.status} value={group.status} className="mt-4">
            <JobGroup status={group.status} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function JobGroup({ status }: { status: JobStatus }) {
  const { data: jobs, isLoading, isError } = useMyJobs(status);

  if (isLoading) {
    return (
      <div data-ocid="my_jobs.loading_state" className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => `job-skeleton-${i}`).map((id) => (
          <Skeleton key={id} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p
        data-ocid="my_jobs.error_state"
        className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive"
      >
        โหลดรายการงานไม่สำเร็จ กรุณาลองรีเฟรชหน้า
      </p>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div
        data-ocid="my_jobs.empty_state"
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-14 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Briefcase className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="font-display text-base font-bold text-foreground">
          ยังไม่มีงานในสถานะนี้
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          เมื่อมีงานในสถานะนี้ รายการจะปรากฏที่นี่
        </p>
      </div>
    );
  }

  return (
    <ul data-ocid="my_jobs.list" className="flex flex-col gap-3">
      {jobs.map((job, index) => (
        <MyJobRow key={job.id.toString()} job={job} index={index} />
      ))}
    </ul>
  );
}

function MyJobRow({ job, index }: { job: Job; index: number }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateJob = useUpdateJob(job.id);
  const closeJob = useCloseJob(job.id);
  const deleteJob = useDeleteJob(job.id);

  function handleUpdate(update: JobUpdate) {
    updateJob.mutate(update, {
      onSuccess: () => {
        toast.success("บันทึกการแก้ไขแล้ว");
        setEditOpen(false);
      },
      onError: () => toast.error("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  function handleClose() {
    closeJob.mutate(undefined, {
      onSuccess: () => toast.success("ปิดรับข้อเสนอแล้ว"),
      onError: () => toast.error("ปิดงานไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  function handleDelete() {
    deleteJob.mutate(undefined, {
      onSuccess: () => {
        toast.success("ลบงานแล้ว");
        setDeleteOpen(false);
      },
      onError: () => toast.error("ลบงานไม่สำเร็จ กรุณาลองอีกครั้ง"),
    });
  }

  return (
    <li
      data-ocid={`my_jobs.item.${index + 1}`}
      className="rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to="/jobs/$id"
            params={{ id: job.id.toString() }}
            data-ocid={`my_jobs.title_link.${index + 1}`}
            className="font-display text-base font-bold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {job.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge kind="job" status={job.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {categoryLabel(job.category)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground nums-tabular">
              {formatBudgetRange(job.budget.min, job.budget.max)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{job.location || "ไม่ระบุพื้นที่"}</span>
            </span>
            <span className="nums-tabular">
              {formatRelativeTime(job.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid={`my_jobs.edit_button.${index + 1}`}
            onClick={() => setEditOpen(true)}
            className="rounded-full"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            แก้ไข
          </Button>
          {job.status === JobStatusEnum.open && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid={`my_jobs.close_button.${index + 1}`}
              disabled={closeJob.isPending}
              onClick={handleClose}
              className="rounded-full"
            >
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
              ปิดรับ
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid={`my_jobs.delete_button.${index + 1}`}
            onClick={() => setDeleteOpen(true)}
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            ลบ
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขงาน</DialogTitle>
            <DialogDescription>
              ปรับรายละเอียดงานของคุณ แล้วกดบันทึก
            </DialogDescription>
          </DialogHeader>
          <JobForm
            initial={job}
            onSubmit={handleUpdate}
            isSubmitting={updateJob.isPending}
            submitLabel="บันทึกการแก้ไข"
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบงานนี้?</AlertDialogTitle>
            <AlertDialogDescription>
              การลบไม่สามารถย้อนกลับได้ ข้อเสนอทั้งหมดของงานนี้จะหายไปด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid={`my_jobs.cancel_delete_button.${index + 1}`}
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid={`my_jobs.confirm_delete_button.${index + 1}`}
              disabled={deleteJob.isPending}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบงาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function AuthGate({
  title,
  description,
  isInitializing,
  onLogin,
  ocid,
}: {
  title: string;
  description: string;
  isInitializing: boolean;
  onLogin: () => void;
  ocid: string;
}) {
  return (
    <div
      data-ocid={`${ocid}.auth_required`}
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LogIn className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="font-display text-2xl font-bold text-foreground">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button
        type="button"
        data-ocid={`${ocid}.sign_in_button`}
        disabled={isInitializing}
        onClick={onLogin}
        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isInitializing ? "กำลังโหลด…" : "เข้าสู่ระบบ"}
      </Button>
    </div>
  );
}
