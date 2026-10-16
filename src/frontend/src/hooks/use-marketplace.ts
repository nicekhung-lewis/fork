import { useBackend } from "@/hooks/use-backend";
import { jobDetailKey, jobOffersKey, publicProfileKey } from "@/hooks/use-jobs";
import { PROFILE_QUERY_KEY } from "@/hooks/use-profile";
import type {
  Job,
  JobDraft,
  JobId,
  JobStatus,
  JobUpdate,
  Message,
  MessageId,
  Offer,
  OfferStatus,
  Review,
  ReviewDraft,
  ReviewId,
  UserId,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const MY_JOBS_KEY = ["jobs", "mine"] as const;
export const MY_OFFERS_KEY = ["offers", "mine"] as const;
export const messagesKey = (jobId: JobId) => ["messages", jobId] as const;
export const reviewsKey = (user: UserId) => ["reviews", user.toText()] as const;

/* -------------------------------------------------------------------------- */
/* Jobs                                                                       */
/* -------------------------------------------------------------------------- */

/** The caller's own jobs, optionally filtered by status. */
export function useMyJobs(status: JobStatus | null) {
  const { actor, isFetching } = useBackend();

  return useQuery<Job[]>({
    queryKey: [...MY_JOBS_KEY, status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyJobs(status);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Create a job owned by the caller; returns the new job id. */
export function useCreateJob() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<JobId, Error, JobDraft>({
    mutationFn: async (draft) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.createJob(draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_JOBS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["jobs", "search"] });
    },
  });
}

/** Edit a job the caller owns. */
export function useUpdateJob(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<Job, Error, JobUpdate>({
    mutationFn: async (update) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.updateJob(jobId, update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_JOBS_KEY });
      void queryClient.invalidateQueries({ queryKey: jobDetailKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: ["jobs", "search"] });
    },
  });
}

/** Close a job the caller owns. */
export function useCloseJob(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<Job, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.closeJob(jobId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_JOBS_KEY });
      void queryClient.invalidateQueries({ queryKey: jobDetailKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: ["jobs", "search"] });
    },
  });
}

/** Delete a job the caller owns. */
export function useDeleteJob(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.deleteJob(jobId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_JOBS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["jobs", "search"] });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Offers                                                                     */
/* -------------------------------------------------------------------------- */

/** The caller's own offers, optionally filtered by status. */
export function useMyOffers(status: OfferStatus | null) {
  const { actor, isFetching } = useBackend();

  return useQuery<Offer[]>({
    queryKey: [...MY_OFFERS_KEY, status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyOffers(status);
    },
    enabled: !!actor && !isFetching,
  });
}

/* -------------------------------------------------------------------------- */
/* Completion                                                                 */
/* -------------------------------------------------------------------------- */

/** Confirm completion from the caller's side. */
export function useConfirmCompletion(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<Offer, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.confirmCompletion(jobId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobDetailKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: MY_JOBS_KEY });
      void queryClient.invalidateQueries({ queryKey: MY_OFFERS_KEY });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Messages                                                                   */
/* -------------------------------------------------------------------------- */

/** Messages of a job thread (participants only). */
export function useMessages(jobId: JobId) {
  const { actor, isFetching } = useBackend();

  return useQuery<Message[]>({
    queryKey: messagesKey(jobId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMessages(jobId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

/** Send a chat message in a job thread. */
export function useSendMessage(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<MessageId, Error, string>({
    mutationFn: async (body) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.sendMessage(jobId, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messagesKey(jobId) });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Reviews                                                                    */
/* -------------------------------------------------------------------------- */

/** Reviews received by a user. */
export function useReviewsForUser(user: UserId | null) {
  const { actor, isFetching } = useBackend();

  return useQuery<Review[]>({
    queryKey: user ? reviewsKey(user) : ["reviews", "none"],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.listReviewsForUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

/** Leave a 1–5 star review for the other party after a completed job. */
export function useLeaveReview(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<ReviewId, Error, ReviewDraft>({
    mutationFn: async (draft) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.leaveReview(jobId, draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobDetailKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["profile", "public"] });
    },
  });
}

/** Re-exported so pages can invalidate the public profile after a review. */
export { publicProfileKey, jobDetailKey, jobOffersKey };
