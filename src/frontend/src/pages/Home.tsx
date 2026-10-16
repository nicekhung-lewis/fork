import { JobCard } from "@/components/JobCard";
import { type JobFilterValues, JobFilters } from "@/components/JobFilters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchJobs } from "@/hooks/use-jobs";
import { CATEGORIES } from "@/lib/categories";
import { type Category, type JobFilter, JobSort } from "@/types";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, SearchX } from "lucide-react";
import { useMemo } from "react";

const CATEGORY_VALUES = new Set<string>(
  CATEGORIES.map((category) => category.value),
);

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Parse the raw URL search params into validated filter values. */
function parseFilters(search: Record<string, unknown>): JobFilterValues {
  const category = readString(search.category);
  const sort = readString(search.sort);
  return {
    keyword: readString(search.keyword),
    category: CATEGORY_VALUES.has(category) ? category : "",
    minBudget: readString(search.minBudget),
    maxBudget: readString(search.maxBudget),
    location: readString(search.location),
    sort:
      sort === JobSort.highestBudget ? JobSort.highestBudget : JobSort.newest,
  };
}

/** Build the backend filter from validated URL values. */
function toBackendFilter(values: JobFilterValues): JobFilter {
  const min = Number(values.minBudget);
  const max = Number(values.maxBudget);
  return {
    keyword: values.keyword.trim() || undefined,
    category: values.category ? (values.category as Category) : undefined,
    minBudget:
      values.minBudget !== "" && Number.isFinite(min) && min >= 0
        ? BigInt(Math.round(min))
        : undefined,
    maxBudget:
      values.maxBudget !== "" && Number.isFinite(max) && max >= 0
        ? BigInt(Math.round(max))
        : undefined,
    location: values.location.trim() || undefined,
    sort: values.sort,
  };
}

const SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `job-skeleton-${i}`);

export function Home() {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();

  const filters = useMemo(() => parseFilters(search), [search]);
  const backendFilter = useMemo(() => toBackendFilter(filters), [filters]);
  const { data, isLoading, isError, refetch } = useSearchJobs(backendFilter);

  const jobs = data?.jobs ?? [];
  const total = data ? Number(data.total) : 0;

  function updateFilters(next: Partial<JobFilterValues>) {
    const merged = { ...filters, ...next };
    void navigate({
      to: "/",
      search: {
        keyword: merged.keyword || undefined,
        category: merged.category || undefined,
        minBudget: merged.minBudget || undefined,
        maxBudget: merged.maxBudget || undefined,
        location: merged.location || undefined,
        sort: merged.sort === JobSort.newest ? undefined : merged.sort,
      },
      replace: true,
    });
  }

  function resetFilters() {
    void navigate({ to: "/", search: {}, replace: true });
  }

  return (
    <div
      data-ocid="home.page"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            ตลาดงาน
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ค้นหางานที่ใช่ ส่งข้อเสนอ และเริ่มทำงานได้ทันที
          </p>
        </div>
        <Button
          asChild
          data-ocid="home.post_job_button"
          className="self-start rounded-full bg-accent text-accent-foreground hover:bg-accent/90 sm:self-auto"
        >
          <Link to="/jobs/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            โพสต์งาน
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="รายการงาน" className="min-w-0">
          {isLoading ? (
            <div
              data-ocid="home.loading_state"
              className="grid gap-4 sm:grid-cols-2"
            >
              {SKELETON_IDS.map((id) => (
                <div
                  key={id}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="mt-auto h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div
              data-ocid="home.error_state"
              className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
            >
              <p className="font-display text-base font-bold text-foreground">
                โหลดรายการงานไม่สำเร็จ
              </p>
              <p className="text-sm text-muted-foreground">
                เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="home.retry_button"
                onClick={() => void refetch()}
                className="rounded-full"
              >
                ลองใหม่
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div
              data-ocid="home.empty_state"
              className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-16 text-center"
            >
              <SearchX
                className="h-10 w-10 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-display text-lg font-bold text-foreground">
                ไม่พบงานที่ตรงกับเงื่อนไข
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                ลองปรับคำค้นหา หมวดหมู่ หรือช่วงงบประมาณ แล้วค้นหาอีกครั้ง
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="home.clear_filters_button"
                onClick={resetFilters}
                className="rounded-full"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          ) : (
            <>
              <p
                data-ocid="home.result_summary"
                className="mb-3 text-sm text-muted-foreground"
              >
                พบ{" "}
                <span className="font-semibold text-foreground nums-tabular">
                  {total}
                </span>{" "}
                งานที่เปิดรับข้อเสนอ
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {jobs.map((job, index) => (
                  <JobCard
                    key={job.id.toString()}
                    job={job}
                    index={index + 1}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <JobFilters
          values={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          resultCount={total}
          className="lg:sticky lg:top-20 lg:self-start"
        />
      </div>
    </div>
  );
}
