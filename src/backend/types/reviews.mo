import Common "common";

module {
  public type UserId = Common.UserId;
  public type JobId = Common.JobId;
  public type ReviewId = Common.ReviewId;
  public type Timestamp = Common.Timestamp;

  /// A review left by one party for the other after a job completes.
  public type Review = {
    id : ReviewId;
    jobId : JobId;
    author : UserId;
    subject : UserId;
    rating : Nat; // 1..5
    comment : Text;
    createdAt : Timestamp;
  };

  /// Fields supplied when leaving a review.
  public type ReviewDraft = {
    rating : Nat; // 1..5
    comment : Text;
  };
};
