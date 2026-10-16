import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";

import Types "../types/reviews";
import Common "../types/common";
import JobsTypes "../types/jobs";
import OffersTypes "../types/offers";

module {
  /// Leave a 1–5 star review for the other party after a completed job.
  public func leaveReview(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    state : { var nextReviewId : Nat },
    caller : Types.UserId,
    jobId : Types.JobId,
    draft : Types.ReviewDraft,
  ) : Types.ReviewId {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (job.status != #completed) {
      Runtime.trap("Reviews can only be left after the job is completed");
    };
    let offerId = job.acceptedOfferId
      ?? Runtime.trap("This job has no accepted offer");
    let offer = offers.get(offerId)
      ?? Runtime.trap("Accepted offer not found");

    let isOwner = Principal.equal(job.owner, caller);
    let isWorker = Principal.equal(offer.worker, caller);
    if (not (isOwner or isWorker)) {
      Runtime.trap("Only the client and the accepted worker may review this job");
    };
    if (draft.rating < 1 or draft.rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let alreadyReviewed = reviews.any(func(_, review) {
      review.jobId == jobId and Principal.equal(review.author, caller);
    });
    if (alreadyReviewed) {
      Runtime.trap("You have already reviewed this job");
    };

    let subject = if (isOwner) { offer.worker } else { job.owner };
    let id = state.nextReviewId;
    state.nextReviewId := id + 1;
    let review : Types.Review = {
      id;
      jobId;
      author = caller;
      subject;
      rating = draft.rating;
      comment = draft.comment;
      createdAt = Int.abs(Time.now());
    };
    reviews.add(id, review);
    id;
  };

  /// List reviews received by a user.
  public func listReviewsForUser(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    user : Types.UserId,
  ) : [Types.Review] {
    let result = reviews.values().filter(func(review) {
      Principal.equal(review.subject, user);
    }).toArray();
    result.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };
};
