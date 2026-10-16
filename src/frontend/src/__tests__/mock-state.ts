import type { backendInterface } from "@/backend";
import { Category, JobStatus, OfferStatus, UserRole } from "@/types";
import type {
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
  Profile,
  ProfileUpdate,
  PublicProfile,
  Review,
  ReviewDraft,
  ReviewId,
  UserId,
} from "@/types";
import { vi } from "vitest";

/**
 * Mutable state shared between the platform-module mock (registered in
 * `vitest.setup.ts`) and the tests. Kept in its own module so the mock factory
 * can load it dynamically without importing production code.
 */

export interface MockAuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  principal: string | null;
  login: () => void;
  logout: () => void;
}

export const authState: MockAuthState = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  principal: null,
  login: vi.fn(),
  logout: vi.fn(),
};

export function resetAuth(): void {
  authState.isAuthenticated = false;
  authState.isInitializing = false;
  authState.isLoggingIn = false;
  authState.principal = null;
  authState.login = vi.fn();
  authState.logout = vi.fn();
}

export function signIn(principalText: string): void {
  authState.isAuthenticated = true;
  authState.principal = principalText;
}

export const actorState: {
  actor: backendInterface | null;
  isFetching: boolean;
} = {
  actor: null,
  isFetching: false,
};

export function principal(text: string): UserId {
  return { toText: () => text } as unknown as UserId;
}

export const ALICE = "aaaaa-aa";
export const BOB = "bbbbb-bb";

export function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 1n,
    status: JobStatus.open,
    title: "ทำความสะอาดคอนโด",
    owner: principal(ALICE),
    createdAt: 1_700_000_000_000_000_000n,
    description: "รายละเอียดงาน",
    updatedAt: 1_700_000_000_000_000_000n,
    workerCompleted: false,
    category: Category.cleaning,
    clientCompleted: false,
    budget: { min: 500n, max: 1500n },
    location: "กรุงเทพฯ",
    images: [],
    ...overrides,
  };
}

export function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: 1n,
    durationDays: 3n,
    status: OfferStatus.pending,
    createdAt: 1_700_000_000_000_000_000n,
    jobId: 1n,
    message: "ผมรับงานนี้ได้",
    price: 1200n,
    worker: principal(BOB),
    ...overrides,
  };
}

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: principal(ALICE),
    bio: "",
    serviceArea: "",
    displayName: "สมชาย",
    createdAt: 1_700_000_000_000_000_000n,
    updatedAt: 1_700_000_000_000_000_000n,
    skills: [],
    activeRole: UserRole.client,
    ...overrides,
  };
}

export function makePublicProfile(
  overrides: Partial<PublicProfile> = {},
): PublicProfile {
  return {
    profile: makeProfile(),
    stats: { completedJobs: 0n, averageRating: 0, reviewCount: 0n },
    ...overrides,
  };
}

export function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 1n,
    body: "สวัสดีครับ",
    createdAt: 1_700_000_000_000_000_000n,
    jobId: 1n,
    sender: principal(ALICE),
    ...overrides,
  };
}

export function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: 1n,
    subject: principal(BOB),
    createdAt: 1_700_000_000_000_000_000n,
    jobId: 1n,
    author: principal(ALICE),
    comment: "ทำงานดีมาก",
    rating: 5n,
    ...overrides,
  };
}

/**
 * A fully typed stand-in for the generated `Backend` actor. Every method is a
 * `vi.fn` so tests can assert the exact call the UI made and control the reply.
 */
export function createMockActor() {
  return {
    _initialize_access_control: vi.fn(async () => undefined),
    _internet_identity_sign_in_finish: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    })),
    _internet_identity_sign_in_start: vi.fn(async () => new Uint8Array()),
    acceptOffer: vi.fn(async (_jobId: JobId, _offerId: OfferId) => makeOffer()),
    assignCallerUserRole: vi.fn(async () => undefined),
    closeJob: vi.fn(async (_jobId: JobId) => makeJob()),
    confirmCompletion: vi.fn(async (_jobId: JobId) => makeOffer()),
    createJob: vi.fn(async (_draft: JobDraft) => 1n),
    deleteJob: vi.fn(async (_jobId: JobId) => undefined),
    execute: vi.fn(async () => ({ hasMore: false, rows: [] })),
    getApiDoc: vi.fn(async () => "# API"),
    getCallerUserRole: vi.fn(async () => "user" as const),
    getJobDetail: vi.fn(
      async (_jobId: JobId): Promise<Job | null> => makeJob(),
    ),
    getMyProfile: vi.fn(async (): Promise<Profile | null> => makeProfile()),
    getPublicProfile: vi.fn(
      async (_user: UserId): Promise<PublicProfile | null> =>
        makePublicProfile(),
    ),
    isCallerAdmin: vi.fn(async () => false),
    leaveReview: vi.fn(
      async (_jobId: JobId, _draft: ReviewDraft) => 1n as ReviewId,
    ),
    listMessages: vi.fn(async (_jobId: JobId): Promise<Message[]> => []),
    listMyJobs: vi.fn(async (_status: JobStatus | null): Promise<Job[]> => []),
    listMyOffers: vi.fn(
      async (_status: OfferStatus | null): Promise<Offer[]> => [],
    ),
    listOffersForJob: vi.fn(async (_jobId: JobId): Promise<Offer[]> => []),
    listReviewsForUser: vi.fn(async (_user: UserId): Promise<Review[]> => []),
    schema: vi.fn(async () => "{}"),
    searchJobs: vi.fn(
      async (_filter: JobFilter): Promise<JobPage> => ({ jobs: [], total: 0n }),
    ),
    sendMessage: vi.fn(async (_jobId: JobId, _body: string) => 1n as MessageId),
    setMyRole: vi.fn(async (_role: UserRole) => makeProfile()),
    submitOffer: vi.fn(
      async (_jobId: JobId, _draft: OfferDraft) => 1n as OfferId,
    ),
    updateJob: vi.fn(async (_jobId: JobId, _update: JobUpdate) => makeJob()),
    upsertMyProfile: vi.fn(async (_update: ProfileUpdate) => makeProfile()),
  };
}

export type MockActor = ReturnType<typeof createMockActor>;

export function installActor(actor: MockActor = createMockActor()): MockActor {
  actorState.actor = actor as unknown as backendInterface;
  actorState.isFetching = false;
  return actor;
}
