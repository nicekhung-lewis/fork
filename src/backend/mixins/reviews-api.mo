import Map "mo:core/Map";

import Types "../types/reviews";
import Common "../types/common";
import JobsTypes "../types/jobs";
import OffersTypes "../types/offers";
import ReviewsLib "../lib/reviews";

mixin (
  jobs : Map.Map<Common.JobId, JobsTypes.Job>,
  offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
  reviews : Map.Map<Common.ReviewId, Types.Review>,
  state : { var nextReviewId : Nat },
) {
  /// Leave a 1–5 star review for the other party after a completed job.
  public shared ({ caller }) func leaveReview(jobId : Types.JobId, draft : Types.ReviewDraft) : async Types.ReviewId {
    ReviewsLib.leaveReview(jobs, offers, reviews, state, caller, jobId, draft);
  };

  /// List reviews received by a user.
  public query func listReviewsForUser(user : Types.UserId) : async [Types.Review] {
    ReviewsLib.listReviewsForUser(reviews, user);
  };
};
