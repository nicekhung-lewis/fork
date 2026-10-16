import Map "mo:core/Map";

import Types "../types/profiles";
import Common "../types/common";
import JobsTypes "../types/jobs";
import OffersTypes "../types/offers";
import ReviewsTypes "../types/reviews";
import ProfilesLib "../lib/profiles";

mixin (
  profiles : Map.Map<Common.UserId, Types.Profile>,
  jobs : Map.Map<Common.JobId, JobsTypes.Job>,
  offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
  reviews : Map.Map<Common.ReviewId, ReviewsTypes.Review>,
) {
  /// Return the caller's own profile, or null when not yet created.
  public shared ({ caller }) func getMyProfile() : async ?Types.Profile {
    ProfilesLib.getMyProfile(profiles, caller);
  };

  /// Create or update the caller's profile.
  public shared ({ caller }) func upsertMyProfile(update : Types.ProfileUpdate) : async Types.Profile {
    ProfilesLib.upsertMyProfile(profiles, caller, update);
  };

  /// Switch the caller's active role between client and worker.
  public shared ({ caller }) func setMyRole(role : Types.UserRole) : async Types.Profile {
    ProfilesLib.setMyRole(profiles, caller, role);
  };

  /// Public profile plus reputation aggregates for any user.
  public query func getPublicProfile(user : Types.UserId) : async ?Types.PublicProfile {
    ProfilesLib.getPublicProfile(profiles, jobs, offers, reviews, user);
  };
};
