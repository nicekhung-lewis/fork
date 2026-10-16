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
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { type Category, JobSort } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

/** URL-backed filter values. Empty strings mean "not set". */
export interface JobFilterValues {
  keyword: string;
  category: string;
  minBudget: string;
  maxBudget: string;
  location: string;
  sort: JobSort;
}

interface JobFiltersProps {
  values: JobFilterValues;
  onChange: (next: Partial<JobFilterValues>) => void;
  onReset: () => void;
  /** Total results matching the active filter, for the result count. */
  resultCount: number;
  className?: string;
}

const SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: JobSort.newest, label: "ใหม่สุดก่อน" },
  { value: JobSort.highestBudget, label: "งบประมาณสูงสุด" },
];

/**
 * Filter panel for the job feed. Every control reports changes upward; the
 * Home page persists them in the URL search params so links are shareable.
 */
export function JobFilters({
  values,
  onChange,
  onReset,
  resultCount,
  className,
}: JobFiltersProps) {
  const [keyword, setKeyword] = useState(values.keyword);

  // Keep the local keyword input in sync when the URL changes externally
  // (back/forward navigation, shared link) without clobbering active typing.
  useEffect(() => {
    setKeyword(values.keyword);
  }, [values.keyword]);

  const hasActiveFilter =
    values.keyword !== "" ||
    values.category !== "" ||
    values.minBudget !== "" ||
    values.maxBudget !== "" ||
    values.location !== "" ||
    values.sort !== JobSort.newest;

  return (
    <aside
      data-ocid="job_filters.panel"
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-subtle",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 font-display text-base font-bold text-foreground">
          <SlidersHorizontal
            className="h-4 w-4 text-primary"
            aria-hidden="true"
          />
          ตัวกรอง
        </h2>
        <span
          data-ocid="job_filters.result_count"
          className="nums-tabular rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
        >
          {resultCount} งาน
        </span>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onChange({ keyword: keyword.trim() });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-keyword">ค้นหางาน</Label>
          <div className="flex gap-2">
            <Input
              id="filter-keyword"
              data-ocid="job_filters.search_input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="เช่น ทำความสะอาด, ย้ายบ้าน"
              className="min-w-0"
            />
            <Button
              type="submit"
              data-ocid="job_filters.search_button"
              aria-label="ค้นหา"
              className="shrink-0 rounded-full"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-category">หมวดหมู่</Label>
          <Select
            value={values.category === "" ? "all" : values.category}
            onValueChange={(value) =>
              onChange({ category: value === "all" ? "" : value })
            }
          >
            <SelectTrigger
              id="filter-category"
              data-ocid="job_filters.category_select"
              className="w-full"
            >
              <SelectValue placeholder="ทุกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-location">พื้นที่</Label>
          <Input
            id="filter-location"
            data-ocid="job_filters.location_input"
            value={values.location}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder="เช่น กรุงเทพฯ, เชียงใหม่"
          />
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-foreground">
            ช่วงงบประมาณ (บาท)
          </legend>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="งบประมาณต่ำสุด"
              data-ocid="job_filters.min_budget_input"
              value={values.minBudget}
              onChange={(event) => onChange({ minBudget: event.target.value })}
              placeholder="ต่ำสุด"
              className="nums-tabular min-w-0"
            />
            <span className="text-muted-foreground" aria-hidden="true">
              –
            </span>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="งบประมาณสูงสุด"
              data-ocid="job_filters.max_budget_input"
              value={values.maxBudget}
              onChange={(event) => onChange({ maxBudget: event.target.value })}
              placeholder="สูงสุด"
              className="nums-tabular min-w-0"
            />
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-sort">เรียงตาม</Label>
          <Select
            value={values.sort}
            onValueChange={(value) => onChange({ sort: value as JobSort })}
          >
            <SelectTrigger
              id="filter-sort"
              data-ocid="job_filters.sort_select"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>

      {hasActiveFilter && (
        <Button
          type="button"
          variant="ghost"
          data-ocid="job_filters.reset_button"
          onClick={onReset}
          className="justify-start rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          ล้างตัวกรองทั้งหมด
        </Button>
      )}
    </aside>
  );
}

/** Category values accepted by the filter, exported for URL validation. */
export const FILTER_CATEGORY_VALUES = CATEGORIES.map(
  (category) => category.value,
) as Category[];
