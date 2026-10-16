import { useAuth } from "@/hooks/use-auth";
import { useBackend } from "@/hooks/use-backend";
import type { Profile, ProfileUpdate, UserRole } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const PROFILE_QUERY_KEY = ["myProfile"] as const;

/** The signed-in user's own profile (null until they create one). */
export function useMyProfile() {
  const { actor, isFetching } = useBackend();
  const { isAuthenticated } = useAuth();

  return useQuery<Profile | null>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

/** Create or update the caller's profile. */
export function useUpsertProfile() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: ProfileUpdate) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.upsertMyProfile(update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

/** Switch the caller's active role between client and worker. */
export function useSetRole() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: UserRole) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่สำเร็จ");
      return actor.setMyRole(role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
