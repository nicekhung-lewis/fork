import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Job {
    id: JobId;
    status: JobStatus;
    title: string;
    owner: UserId;
    createdAt: Timestamp;
    acceptedOfferId?: bigint;
    dueDate?: Timestamp;
    description: string;
    updatedAt: Timestamp;
    workerCompleted: boolean;
    category: Category;
    clientCompleted: boolean;
    budget: PriceRange;
    location: string;
    images: Array<Uint8Array>;
}
export interface JobDraft {
    title: string;
    dueDate?: Timestamp;
    description: string;
    category: Category;
    budget: PriceRange;
    location: string;
    images: Array<Uint8Array>;
}
export interface JobFilter {
    minBudget?: bigint;
    sort: JobSort;
    category?: Category;
    keyword?: string;
    location?: string;
    maxBudget?: bigint;
}
export type JobId = bigint;
export interface JobPage {
    total: bigint;
    jobs: Array<Job>;
}
export interface JobUpdate {
    title?: string;
    dueDate?: Timestamp;
    description?: string;
    category?: Category;
    budget?: PriceRange;
    location?: string;
    images?: Array<Uint8Array>;
}
export interface Message {
    id: MessageId;
    body: string;
    createdAt: Timestamp;
    jobId: JobId;
    sender: UserId;
}
export type MessageId = bigint;
export interface Offer {
    id: OfferId;
    durationDays: bigint;
    status: OfferStatus;
    createdAt: Timestamp;
    jobId: JobId;
    message: string;
    price: bigint;
    worker: UserId;
}
export interface OfferDraft {
    durationDays: bigint;
    message: string;
    price: bigint;
}
export type OfferId = bigint;
export interface PriceRange {
    max: bigint;
    min: bigint;
}
export interface Profile {
    id: UserId;
    bio: string;
    serviceArea: string;
    displayName: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    skills: Array<string>;
    activeRole: UserRole;
    avatar?: Uint8Array;
}
export interface ProfileStats {
    completedJobs: bigint;
    averageRating: number;
    reviewCount: bigint;
}
export interface ProfileUpdate {
    bio?: string;
    serviceArea?: string;
    displayName?: string;
    skills?: Array<string>;
    avatar?: Uint8Array;
}
export interface PublicProfile {
    stats: ProfileStats;
    profile: Profile;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Review {
    id: ReviewId;
    subject: UserId;
    createdAt: Timestamp;
    jobId: JobId;
    author: UserId;
    comment: string;
    rating: bigint;
}
export interface ReviewDraft {
    comment: string;
    rating: bigint;
}
export type ReviewId = bigint;
export type Timestamp = bigint;
export type UserId = Principal;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum Category {
    cleaning = "cleaning",
    other = "other",
    design = "design",
    gardening = "gardening",
    tutoring = "tutoring",
    events = "events",
    delivery = "delivery",
    assembly = "assembly",
    webDevelopment = "webDevelopment",
    moving = "moving",
    handyman = "handyman",
    photography = "photography"
}
export enum JobSort {
    highestBudget = "highestBudget",
    newest = "newest"
}
export enum JobStatus {
    closed = "closed",
    open = "open",
    completed = "completed",
    inProgress = "inProgress"
}
export enum OfferStatus {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum UserRole {
    client = "client",
    worker = "worker"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Accept one offer for a job the caller owns; rejects the rest and moves the
     * / job to in-progress.
     */
    acceptOffer(jobId: JobId, offerId: OfferId): Promise<Offer>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    /**
     * / Close a job the caller owns.
     */
    closeJob(jobId: JobId): Promise<Job>;
    /**
     * / Confirm completion from the caller's side; when both parties confirm the
     * / job becomes completed.
     */
    confirmCompletion(jobId: JobId): Promise<Offer>;
    /**
     * / Create a job owned by the caller; returns the new job id.
     */
    createJob(draft: JobDraft): Promise<JobId>;
    /**
     * / Delete a job the caller owns.
     */
    deleteJob(jobId: JobId): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Return the backend API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole__1>;
    /**
     * / Public job detail including its offers.
     */
    getJobDetail(jobId: JobId): Promise<Job | null>;
    /**
     * / Return the caller's own profile, or null when not yet created.
     */
    getMyProfile(): Promise<Profile | null>;
    /**
     * / Public profile plus reputation aggregates for any user.
     */
    getPublicProfile(user: UserId): Promise<PublicProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Leave a 1–5 star review for the other party after a completed job.
     */
    leaveReview(jobId: JobId, draft: ReviewDraft): Promise<ReviewId>;
    /**
     * / List the messages of a job thread (participants only).
     */
    listMessages(jobId: JobId): Promise<Array<Message>>;
    /**
     * / List the caller's own jobs, optionally filtered by status.
     */
    listMyJobs(status: JobStatus | null): Promise<Array<Job>>;
    /**
     * / List the caller's own offers, optionally filtered by status.
     */
    listMyOffers(status: OfferStatus | null): Promise<Array<Offer>>;
    /**
     * / List all offers for a job (visible to the job owner).
     */
    listOffersForJob(jobId: JobId): Promise<Array<Offer>>;
    /**
     * / List reviews received by a user.
     */
    listReviewsForUser(user: UserId): Promise<Array<Review>>;
    schema(): Promise<string>;
    /**
     * / Search open jobs with keyword / category / budget / location filters and sort.
     */
    searchJobs(filter: JobFilter): Promise<JobPage>;
    /**
     * / Send a chat message in a job thread (client or accepted worker only).
     */
    sendMessage(jobId: JobId, body: string): Promise<MessageId>;
    /**
     * / Switch the caller's active role between client and worker.
     */
    setMyRole(role: UserRole): Promise<Profile>;
    /**
     * / Submit an offer from the caller for a job.
     */
    submitOffer(jobId: JobId, draft: OfferDraft): Promise<OfferId>;
    /**
     * / Edit a job the caller owns.
     */
    updateJob(jobId: JobId, update: JobUpdate): Promise<Job>;
    /**
     * / Create or update the caller's profile.
     */
    upsertMyProfile(update: ProfileUpdate): Promise<Profile>;
}
