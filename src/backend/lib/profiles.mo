import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";

import Types "../types/profiles";
import Common "../types/common";
import JobsTypes "../types/jobs";
import OffersTypes "../types/offers";
import ReviewsTypes "../types/reviews";

module {
  /// Return the caller's own profile, or null when not yet created.
  public func getMyProfile(
    profiles : Map.Map<Types.UserId, Types.Profile>,
    caller : Types.UserId,
  ) : ?Types.Profile {
    profiles.get(caller);
  };

  /// Create the caller's profile if absent; return the current profile.
  public func upsertMyProfile(
    profiles : Map.Map<Types.UserId, Types.Profile>,
    caller : Types.UserId,
    update : Types.ProfileUpdate,
  ) : Types.Profile {
    let now = Int.abs(Time.now());
    switch (profiles.get(caller)) {
      case (?existing) {
        let updated : Types.Profile = {
          id = existing.id;
          displayName = update.displayName ?? existing.displayName;
          avatar = switch (update.avatar) {
            case (?a) { ?a };
            case null { existing.avatar };
          };
          bio = update.bio ?? existing.bio;
          serviceArea = update.serviceArea ?? existing.serviceArea;
          skills = update.skills ?? existing.skills;
          activeRole = existing.activeRole;
          createdAt = existing.createdAt;
          updatedAt = now;
        };
        profiles.add(caller, updated);
        updated;
      };
      case null {
        let created : Types.Profile = {
          id = caller;
          displayName = update.displayName ?? "";
          avatar = update.avatar;
          bio = update.bio ?? "";
          serviceArea = update.serviceArea ?? "";
          skills = update.skills ?? [];
          activeRole = #client;
          createdAt = now;
          updatedAt = now;
        };
        profiles.add(caller, created);
        created;
      };
    };
  };

  /// Switch the caller's active role between client and worker.
  public func setMyRole(
    profiles : Map.Map<Types.UserId, Types.Profile>,
    caller : Types.UserId,
    role : Types.UserRole,
  ) : Types.Profile {
    let existing = profiles.get(caller)
      ?? Runtime.trap("Profile not found: create a profile before setting a role");
    let updated : Types.Profile = {
      id = existing.id;
      displayName = existing.displayName;
      avatar = existing.avatar;
      bio = existing.bio;
      serviceArea = existing.serviceArea;
      skills = existing.skills;
      activeRole = role;
      createdAt = existing.createdAt;
      updatedAt = Int.abs(Time.now());
    };
    profiles.add(caller, updated);
    updated;
  };

  /// Public profile plus reputation aggregates for any user.
  public func getPublicProfile(
    profiles : Map.Map<Types.UserId, Types.Profile>,
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
    reviews : Map.Map<Common.ReviewId, ReviewsTypes.Review>,
    user : Types.UserId,
  ) : ?Types.PublicProfile {
    switch (profiles.get(user)) {
      case null { null };
      case (?profile) {
        var ratingSum : Nat = 0;
        var reviewCount : Nat = 0;
        for (review in reviews.values()) {
          if (Principal.equal(review.subject, user)) {
            ratingSum += review.rating;
            reviewCount += 1;
          };
        };
        let averageRating : Float = if (reviewCount == 0) {
          0.0;
        } else {
          ratingSum.toFloat() / reviewCount.toFloat();
        };

        var completedJobs : Nat = 0;
        for (job in jobs.values()) {
          if (job.status == #completed) {
            var isWorker = false;
            switch (job.acceptedOfferId) {
              case null {};
              case (?offerId) {
                switch (offers.get(offerId)) {
                  case null {};
                  case (?offer) {
                    if (Principal.equal(offer.worker, user)) {
                      isWorker := true;
                    };
                  };
                };
              };
            };
            if (Principal.equal(job.owner, user) or isWorker) {
              completedJobs += 1;
            };
          };
        };

        ?{
          profile;
          stats = {
            averageRating;
            reviewCount;
            completedJobs;
          };
        };
      };
    };
  };
};
