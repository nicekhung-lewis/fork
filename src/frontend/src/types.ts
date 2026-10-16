/**
 * Shared frontend types.
 *
 * Backend enums are re-exported as VALUES (not `export type`) so pages can use
 * `JobStatus.open`, `Category.cleaning`, etc. in comparisons and switches.
 */
export {
  Category,
  JobSort,
  JobStatus,
  OfferStatus,
  UserRole,
} from "@/backend";

export type {
  Job,
  JobDraft,
  JobFilter,
  JobId,
  JobPage,
  JobUpdate,
  Message,
  MessageId,
  Offer,
  OfferDraft,
  OfferId,
  PriceRange,
  Profile,
  ProfileStats,
  ProfileUpdate,
  PublicProfile,
  Review,
  ReviewDraft,
  ReviewId,
  Timestamp,
  UserId,
} from "@/backend";

/** A single option in a select / filter control. */
export interface SelectOption<T extends string> {
  value: T;
  label: string;
}
