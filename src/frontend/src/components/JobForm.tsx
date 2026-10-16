import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBlobUrl } from "@/hooks/use-blob-url";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Category, type Job, type JobDraft, type JobUpdate } from "@/types";
import { ImagePlus, Loader2, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

/** A locally-held image with a stable key for React list rendering. */
interface JobImage {
  id: string;
  bytes: Uint8Array;
}

interface JobFormProps {
  /** Existing job when editing; omit to create a new one. */
  initial?: Job;
  onSubmit: (draft: JobDraft | JobUpdate) => void;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

/** Convert a `YYYY-MM-DD` input value to a nanosecond timestamp. */
function dateInputToTimestamp(value: string): bigint | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return BigInt(date.getTime()) * 1_000_000n;
}

/** Convert a nanosecond timestamp to a `YYYY-MM-DD` input value. */
function timestampToDateInput(timestamp: bigint | undefined): string {
  if (timestamp === undefined) return "";
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "";
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

async function readFiles(files: FileList): Promise<Uint8Array[]> {
  const results: Uint8Array[] = [];
  for (const file of Array.from(files)) {
    const buffer = await file.arrayBuffer();
    results.push(new Uint8Array(buffer));
  }
  return results;
}

/**
 * Create/edit form for a job post. Owns every field locally and reports a
 * `JobDraft` (create) or `JobUpdate` (edit) to the caller.
 */
export function JobForm({
  initial,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
}: JobFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<Category>(
    initial?.category ?? Category.cleaning,
  );
  const [minBudget, setMinBudget] = useState(
    initial ? initial.budget.min.toString() : "",
  );
  const [maxBudget, setMaxBudget] = useState(
    initial ? initial.budget.max.toString() : "",
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [dueDate, setDueDate] = useState(
    timestampToDateInput(initial?.dueDate),
  );
  const [images, setImages] = useState<JobImage[]>(() =>
    (initial?.images ?? []).map((bytes, i) => ({
      id: `existing-${i}`,
      bytes,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const next = await readFiles(files);
    setImages((current) =>
      [
        ...current,
        ...next.map((bytes, i) => ({
          id: `upload-${Date.now()}-${i}`,
          bytes,
        })),
      ].slice(0, 5),
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const min = Number.parseInt(minBudget, 10);
    const max = Number.parseInt(maxBudget, 10);

    if (!title.trim()) {
      setError("กรุณากรอกหัวข้องาน");
      return;
    }
    if (!description.trim()) {
      setError("กรุณากรอกรายละเอียดงาน");
      return;
    }
    if (!Number.isFinite(min) || min < 0) {
      setError("กรุณากรอกงบประมาณขั้นต่ำให้ถูกต้อง");
      return;
    }
    if (!Number.isFinite(max) || max < min) {
      setError("งบประมาณสูงสุดต้องไม่น้อยกว่าขั้นต่ำ");
      return;
    }
    if (!location.trim()) {
      setError("กรุณากรอกสถานที่ให้บริการ");
      return;
    }

    setError(null);
    const budget = { min: BigInt(min), max: BigInt(max) };
    const due = dateInputToTimestamp(dueDate);
    const imageBytes = images.map((image) => image.bytes);

    if (initial) {
      const update: JobUpdate = {
        title: title.trim(),
        description: description.trim(),
        category,
        budget,
        location: location.trim(),
        images: imageBytes,
      };
      if (due !== undefined) update.dueDate = due;
      onSubmit(update);
    } else {
      const draft: JobDraft = {
        title: title.trim(),
        description: description.trim(),
        category,
        budget,
        location: location.trim(),
        images: imageBytes,
      };
      if (due !== undefined) draft.dueDate = due;
      onSubmit(draft);
    }
  }

  return (
    <form
      data-ocid="job_form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="job-title">หัวข้องาน</Label>
        <Input
          id="job-title"
          data-ocid="job_form.title_input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="เช่น ทำความสะอาดคอนโด 2 ห้องนอน"
          maxLength={120}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="job-description">รายละเอียดงาน</Label>
        <Textarea
          id="job-description"
          data-ocid="job_form.description_textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="อธิบายขอบเขตงาน สิ่งที่ต้องเตรียม และความต้องการพิเศษ"
          rows={5}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-category">หมวดหมู่</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as Category)}
          >
            <SelectTrigger
              id="job-category"
              data-ocid="job_form.category_select"
              className="w-full"
            >
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((meta) => (
                <SelectItem key={meta.value} value={meta.value}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="job-location">สถานที่</Label>
          <Input
            id="job-location"
            data-ocid="job_form.location_input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="เช่น อารีย์ กรุงเทพฯ"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-min">งบประมาณขั้นต่ำ (บาท)</Label>
          <Input
            id="job-min"
            data-ocid="job_form.min_budget_input"
            type="number"
            inputMode="numeric"
            min={0}
            value={minBudget}
            onChange={(event) => setMinBudget(event.target.value)}
            placeholder="500"
            className="nums-tabular"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-max">งบประมาณสูงสุด (บาท)</Label>
          <Input
            id="job-max"
            data-ocid="job_form.max_budget_input"
            type="number"
            inputMode="numeric"
            min={0}
            value={maxBudget}
            onChange={(event) => setMaxBudget(event.target.value)}
            placeholder="1500"
            className="nums-tabular"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-due">วันที่ต้องการ</Label>
          <Input
            id="job-due"
            data-ocid="job_form.due_date_input"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="job-images">รูปภาพประกอบ (ไม่เกิน 5 รูป)</Label>
        <div className="flex flex-wrap items-center gap-3">
          {images.map((image, index) => (
            <JobImageThumb
              key={image.id}
              image={image.bytes}
              index={index}
              onRemove={() => removeImage(image.id)}
            />
          ))}
          {images.length < 5 && (
            <button
              type="button"
              data-ocid="job_form.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-secondary/50 text-muted-foreground transition-smooth",
                "hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-medium">เพิ่มรูป</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          id="job-images"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleFiles}
        />
      </div>

      {error && (
        <p
          data-ocid="job_form.error_state"
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            data-ocid="job_form.cancel_button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-full"
          >
            ยกเลิก
          </Button>
        )}
        <Button
          type="submit"
          data-ocid="job_form.submit_button"
          disabled={isSubmitting}
          className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function JobImageThumb({
  image,
  index,
  onRemove,
}: {
  image: Uint8Array;
  index: number;
  onRemove: () => void;
}) {
  const objectUrl = useBlobUrl(image);

  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-secondary">
      {objectUrl && (
        <img
          src={objectUrl}
          alt={`รูปประกอบ ${index + 1}`}
          className="h-full w-full object-cover"
        />
      )}
      <button
        type="button"
        data-ocid={`job_form.remove_image_button.${index + 1}`}
        aria-label={`ลบรูปที่ ${index + 1}`}
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-smooth hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
