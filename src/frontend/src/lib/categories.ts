import { Category } from "@/types";
import {
  BookOpen,
  Brush,
  Camera,
  Code2,
  Hammer,
  Leaf,
  type LucideIcon,
  Package,
  PartyPopper,
  Sofa,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";

export interface CategoryMeta {
  value: Category;
  label: string;
  icon: LucideIcon;
}

/** Thai label + icon for every Category variant, in display order. */
export const CATEGORIES: CategoryMeta[] = [
  { value: Category.cleaning, label: "ทำความสะอาด", icon: Sparkles },
  { value: Category.handyman, label: "ช่างซ่อมบำรุง", icon: Wrench },
  { value: Category.delivery, label: "ขนส่ง / ส่งของ", icon: Truck },
  { value: Category.assembly, label: "ประกอบเฟอร์นิเจอร์", icon: Sofa },
  { value: Category.gardening, label: "จัดสวน", icon: Leaf },
  { value: Category.moving, label: "ย้ายบ้าน", icon: Package },
  { value: Category.tutoring, label: "สอนพิเศษ", icon: BookOpen },
  { value: Category.design, label: "ออกแบบกราฟิก", icon: Brush },
  { value: Category.webDevelopment, label: "พัฒนาเว็บไซต์", icon: Code2 },
  { value: Category.photography, label: "ถ่ายภาพ", icon: Camera },
  { value: Category.events, label: "จัดงานอีเวนต์", icon: PartyPopper },
  { value: Category.other, label: "อื่น ๆ", icon: Hammer },
];

const CATEGORY_MAP = new Map<Category, CategoryMeta>(
  CATEGORIES.map((meta) => [meta.value, meta]),
);

/** Look up the Thai label for a category, falling back to "อื่น ๆ". */
export function categoryLabel(category: Category): string {
  return CATEGORY_MAP.get(category)?.label ?? "อื่น ๆ";
}

/** Look up the icon component for a category, falling back to Hammer. */
export function categoryIcon(category: Category): LucideIcon {
  return CATEGORY_MAP.get(category)?.icon ?? Hammer;
}
