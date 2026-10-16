import { JobStatus, OfferStatus } from "@/types";

export interface StatusMeta {
  label: string;
  /** Tailwind classes for a soft badge surface. */
  className: string;
}

const JOB_STATUS_META: Record<JobStatus, StatusMeta> = {
  [JobStatus.open]: {
    label: "เปิดรับข้อเสนอ",
    className: "bg-success/12 text-success border-success/25",
  },
  [JobStatus.inProgress]: {
    label: "กำลังทำ",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  [JobStatus.completed]: {
    label: "เสร็จแล้ว",
    className: "bg-primary/10 text-primary border-primary/25",
  },
  [JobStatus.closed]: {
    label: "ปิดรับแล้ว",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const OFFER_STATUS_META: Record<OfferStatus, StatusMeta> = {
  [OfferStatus.pending]: {
    label: "รอพิจารณา",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  [OfferStatus.accepted]: {
    label: "ได้รับเลือก",
    className: "bg-success/12 text-success border-success/25",
  },
  [OfferStatus.rejected]: {
    label: "ไม่ได้รับเลือก",
    className: "bg-muted text-muted-foreground border-border",
  },
};

/** Thai label + badge classes for a job status. */
export function jobStatusMeta(status: JobStatus): StatusMeta {
  return JOB_STATUS_META[status];
}

/** Thai label + badge classes for an offer status. */
export function offerStatusMeta(status: OfferStatus): StatusMeta {
  return OFFER_STATUS_META[status];
}
