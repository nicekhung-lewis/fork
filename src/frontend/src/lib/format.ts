import type { Timestamp } from "@/types";

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/**
 * Convert a Motoko `Time.now()` nanosecond bigint into a JS Date.
 * Returns null for values that do not form a valid date.
 */
export function timestampToDate(timestamp: Timestamp): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a whole-baht amount as Thai baht, e.g. `฿1,500`. */
export function formatBaht(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "฿0";
  return `฿${Math.round(value).toLocaleString("th-TH")}`;
}

/** Format a budget range, collapsing to a single value when min === max. */
export function formatBudgetRange(min: bigint, max: bigint): string {
  if (min === max) return formatBaht(min);
  return `${formatBaht(min)} - ${formatBaht(max)}`;
}

/** Short absolute Thai date, e.g. `16 ต.ค. 2569`. */
export function formatThaiDate(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "ไม่ระบุ";
  const day = date.getDate();
  const month = THAI_MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

/** Relative Thai time, e.g. `2 ชั่วโมงที่แล้ว`. */
export function formatRelativeTime(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "ไม่ระบุ";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "เมื่อสักครู่";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek} สัปดาห์ที่แล้ว`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} เดือนที่แล้ว`;
  return `${Math.floor(diffDay / 365)} ปีที่แล้ว`;
}

/** Format a duration in days, e.g. `3 วัน`. */
export function formatDurationDays(days: bigint): string {
  return `${days.toString()} วัน`;
}

/** Format an average rating to one decimal place, e.g. `4.8`. */
export function formatRating(average: number): string {
  if (!Number.isFinite(average) || average <= 0) return "—";
  return average.toFixed(1);
}

/** Shorten a principal for display, e.g. `abcde-…-xyz`. */
export function shortPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-4)}`;
}
