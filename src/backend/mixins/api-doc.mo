/// Static, human-readable documentation of the public backend API.
/// This mixin declares only `getApiDoc`; it reads no state and takes no
/// parameters, so the Markdown is returned directly from the function body.
mixin () {
  /// Return the backend API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "# Marketplace Backend API\n\n" #
    "A single-canister marketplace (Airtasker-style): clients post jobs, workers\n" #
    "submit offers, the client accepts one offer, both parties confirm completion,\n" #
    "and each side can leave a review. There is no payment, escrow, or email\n" #
    "surface in this backend.\n\n" #
    "## Authentication and identity\n\n" #
    "- Every method is callable by any principal, including anonymous callers.\n" #
    "  There is no registration gate and no role guard on the endpoints: the\n" #
    "  backend identifies the caller from the Internet Computer message and uses\n" #
    "  that principal as the user id.\n" #
    "- Methods marked `({ caller })` act on behalf of the caller. A caller that\n" #
    "  has never created a profile is simply treated as a user with no profile\n" #
    "  yet; `getMyProfile` returns `null` and `upsertMyProfile` creates one.\n" #
    "- The app's frontend pins an Internet Identity derivation origin, published\n" #
    "  at `/.well-known/ii-derivation-origin` when available. An agent that\n" #
    "  already holds the user's Internet Identity authorization derives the\n" #
    "  correct per-app principal against that origin (for example\n" #
    "  `icp identity link web <name> --app <host>`). Such a delegation acts with\n" #
    "  the user's full authority in this app until it expires. A principal\n" #
    "  derived against a different origin is a different user than the one the\n" #
    "  frontend registered.\n\n" #
    "## Units and encodings\n\n" #
    "- `budget.min` / `budget.max` and `offer.price` are whole Thai Baht (Nat).\n" #
    "- `offer.durationDays` is a whole number of days (Nat).\n" #
    "- All timestamps (`createdAt`, `updatedAt`, `dueDate`) are nanoseconds since\n" #
    "  the Unix epoch (Nat), as returned by the IC system time.\n" #
    "- `rating` is an integer from 1 to 5.\n" #
    "- `avatar` and `images` are `Blob` values (object-storage references or raw\n" #
    "  bytes); `avatar` is optional and `images` is a list.\n" #
    "- `category`, `status`, and `activeRole` are Candid variants; their tags are\n" #
    "  listed in the type definitions.\n\n" #
    "## Profiles\n\n" #
    "- `getMyProfile() : ?Profile` — the caller's own profile, or `null` if none.\n" #
    "- `upsertMyProfile(update : ProfileUpdate) : Profile` — creates the profile\n" #
    "  if absent, otherwise applies the non-null fields. A `null` field means\n" #
    "  \"leave unchanged\". A newly created profile defaults to `activeRole =\n" #
    "  #client`, empty text fields, and empty skills.\n" #
    "- `setMyRole(role : UserRole) : Profile` — switches the caller's active role\n" #
    "  between `#client` and `#worker`. Traps if the caller has no profile yet.\n" #
    "- `getPublicProfile(user : UserId) : ?PublicProfile` — public profile plus\n" #
    "  reputation aggregates: `averageRating` (0.0 when no reviews),\n" #
    "  `reviewCount`, and `completedJobs` (jobs the user owns or worked on that\n" #
    "  reached `#completed`). Returns `null` when the user has no profile.\n\n" #
    "## Jobs (clients)\n\n" #
    "- `createJob(draft : JobDraft) : JobId` — creates a job owned by the caller\n" #
    "  in status `#open`. Traps if the title is empty or `budget.min >\n" #
    "  budget.max`.\n" #
    "- `updateJob(jobId, update : JobUpdate) : Job` — edits a job the caller\n" #
    "  owns; `null` fields are left unchanged. Traps if the job is missing, the\n" #
    "  caller is not the owner, the resulting title is empty, or the resulting\n" #
    "  budget is inverted.\n" #
    "- `closeJob(jobId) : Job` — sets the job to `#closed`. Owner only.\n" #
    "- `deleteJob(jobId) : ()` — removes the job. Owner only. Destructive and not\n" #
    "  idempotent: a second call traps with \"Job not found\".\n" #
    "- `listMyJobs(status : ?JobStatus) : [Job]` — the caller's own jobs, newest\n" #
    "  first, optionally filtered by status.\n" #
    "- `getJobDetail(jobId) : ?Job` — public job detail, or `null` if absent.\n" #
    "- `searchJobs(filter : JobFilter) : JobPage` — searches `#open` jobs only.\n" #
    "  Keyword matches title or description (case-insensitive substring);\n" #
    "  location is a case-insensitive substring; `minBudget` / `maxBudget`\n" #
    "  compare against the job's budget range. `sort` is `#newest` or\n" #
    "  `#highestBudget`. Returns `{ jobs; total }`.\n\n" #
    "## Offers (workers)\n\n" #
    "- `submitOffer(jobId, draft : OfferDraft) : OfferId` — submits an offer from\n" #
    "  the caller. Traps if the job is missing or not `#open`, the caller owns\n" #
    "  the job, the price is zero, the message is empty, or the caller already\n" #
    "  offered on this job. New offers start `#pending`.\n" #
    "- `listOffersForJob(jobId) : [Offer]` — all offers for a job, oldest first.\n" #
    "  Job owner only; traps otherwise.\n" #
    "- `listMyOffers(status : ?OfferStatus) : [Offer]` — the caller's own offers,\n" #
    "  newest first, optionally filtered by status.\n" #
    "- `acceptOffer(jobId, offerId) : Offer` — the job owner accepts one offer.\n" #
    "  The accepted offer becomes `#accepted`, every other offer on the job\n" #
    "  becomes `#rejected`, and the job moves to `#inProgress` with\n" #
    "  `acceptedOfferId` set. Traps if the caller is not the owner, the job is\n" #
    "  not `#open`, or the offer does not belong to the job.\n" #
    "- `confirmCompletion(jobId) : Offer` — records the caller's completion\n" #
    "  confirmation. Only the job owner or the accepted worker may call it. When\n" #
    "  both sides have confirmed, the job becomes `#completed`; otherwise it\n" #
    "  stays `#inProgress`. Traps if the job is not `#inProgress` or has no\n" #
    "  accepted offer.\n\n" #
    "## Chat (job thread)\n\n" #
    "- `sendMessage(jobId, body : Text) : MessageId` — posts a message to the job\n" #
    "  thread. Only the job owner and the accepted worker may participate. Traps\n" #
    "  if the caller is not a participant or the body is empty.\n" #
    "- `listMessages(jobId) : [Message]` — the thread's messages, oldest first.\n" #
    "  Participants only; traps otherwise.\n" #
    "- Polling: there is no push channel. Poll `listMessages` to see new\n" #
    "  messages; compare the highest `id` or `createdAt` you have already seen\n" #
    "  and fetch again. Messages are append-only and never edited or deleted.\n\n" #
    "## Reviews\n\n" #
    "- `leaveReview(jobId, draft : ReviewDraft) : ReviewId` — leaves a 1–5 star\n" #
    "  review for the other party. Only the job owner or the accepted worker may\n" #
    "  review, and only after the job is `#completed`. Traps if the rating is\n" #
    "  outside 1–5 or the caller already reviewed this job. The review's\n" #
    "  `subject` is the other party.\n" #
    "- `listReviewsForUser(user) : [Review]` — reviews received by a user,\n" #
    "  newest first.\n\n" #
    "## Lifecycle summary\n\n" #
    "- Job status: `#open` → `#inProgress` (on `acceptOffer`) → `#completed`\n" #
    "  (when both parties confirm). A job may also go to `#closed` via\n" #
    "  `closeJob`.\n" #
    "- Offer status: `#pending` → `#accepted` (the chosen offer) or `#rejected`\n" #
    "  (all others, set when an offer is accepted).\n\n" #
    "## Mutation retry safety\n\n" #
    "- `createJob`, `submitOffer`, `sendMessage`, and `leaveReview` are not\n" #
    "  idempotent: each successful call allocates a new id and appends a new\n" #
    "  record, so retrying after a timeout can create a duplicate. Re-read state\n" #
    "  before retrying.\n" #
    "- `upsertMyProfile` and `setMyRole` are idempotent in effect (they overwrite\n" #
    "  the caller's profile).\n" #
    "- `acceptOffer` is effectively idempotent for the chosen offer, but a retry\n" #
    "  after the job left `#open` traps.\n" #
    "- `confirmCompletion` is idempotent: confirming again keeps the same flags.\n" #
    "- `deleteJob` is destructive and not idempotent.\n\n" #
    "## Errors and gotchas\n\n" #
    "- Failures are reported as traps (rejected calls) with a human-readable\n" #
    "  message; there are no `Result` return types. Callers should surface the\n" #
    "  reject message.\n" #
    "- `searchJobs` only ever returns `#open` jobs; closed, in-progress, and\n" #
    "  completed jobs are excluded.\n" #
    "- `listOffersForJob` is owner-only, so a worker cannot see competing offers.\n" #
    "- Chat is available only once a job has an accepted offer (the worker\n" #
    "  becomes a participant at that point).\n" #
    "- Reviews require a `#completed` job, so both parties must confirm\n" #
    "  completion first.\n" #
    "- The OQL `schema()` / `execute()` endpoints expose the `profile`, `job`,\n" #
    "  `offer`, `message`, and `review` tables; `offer` and `message` are\n" #
    "  controller-only, while `profile`, `job`, and `review` are public.\n";
  };
};
