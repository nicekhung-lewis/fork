import { useBackend } from "@/hooks/use-backend";
import type {
  Job,
  JobFilter,
  JobId,
  JobPage,
  Offer,
  OfferDraft,
  OfferId,
  PublicProfile,
  UserId,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const JOB_SEARCH_KEY = ["jobs", "search"] as const;
export const jobDetailKey = (jobId: JobId) =>
  ["jobs", "detail", jobId] as const;
export const jobOffersKey = (jobId: JobId) =>
  ["jobs", "offers", jobId] as const;
export const publicProfileKey = (user: UserId) =>
  ["profile", "public", user.toText()] as const;

/** Search open jobs with the given filter. */
export function useSearchJobs(filter: JobFilter) {
  const { actor, isFetching } = useBackend();

  return useQuery<JobPage>({
    queryKey: [...JOB_SEARCH_KEY, filter],
    queryFn: async () => {
      if (!actor) return { jobs: [], total: 0n };
      return actor.searchJobs(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Public job detail, or null when the job does not exist. */
export function useJobDetail(jobId: JobId) {
  const { actor, isFetching } = useBackend();

  return useQuery<Job | null>({
    queryKey: jobDetailKey(jobId),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getJobDetail(jobId);
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * All offers for a job (visible to the job owner only). Pass
 * `{ enabled: false }` for non-owner viewers so the owner-only query never runs.
 */
export function useJobOffers(jobId: JobId, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useBackend();

  return useQuery<Offer[]>({
    queryKey: jobOffersKey(jobId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOffersForJob(jobId);
    },
    enabled: !!actor && !isFetching && (options?.enabled ?? true),
  });
}

/** Public profile + reputation for any user. */
export function usePublicProfile(user: UserId | null) {
  const { actor, isFetching } = useBackend();

  return useQuery<PublicProfile | null>({
    queryKey: user ? publicProfileKey(user) : ["profile", "public", "none"],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getPublicProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

/** Submit an offer for a job. */
export function useSubmitOffer(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<OfferId, Error, OfferDraft>({
    mutationFn: async (draft) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.submitOffer(jobId, draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobOffersKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: jobDetailKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: ["offers", "mine"] });
    },
  });
}

/** Accept one offer for a job the caller owns. */
export function useAcceptOffer(jobId: JobId) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation<Offer, Error, OfferId>({
    mutationFn: async (offerId) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.acceptOffer(jobId, offerId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: jobOffersKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: jobDetailKey(jobId) });
      void queryClient.invalidateQueries({ queryKey: JOB_SEARCH_KEY });
      void queryClient.invalidateQueries({ queryKey: ["jobs", "mine"] });
    },
  });
}
