import Common "common";

module {
  public type UserId = Common.UserId;
  public type JobId = Common.JobId;
  public type OfferId = Common.OfferId;
  public type Timestamp = Common.Timestamp;
  public type OfferStatus = Common.OfferStatus;

  /// An offer submitted by a worker for a job.
  public type Offer = {
    id : OfferId;
    jobId : JobId;
    worker : UserId;
    price : Nat;
    message : Text;
    durationDays : Nat;
    status : OfferStatus;
    createdAt : Timestamp;
  };

  /// Fields supplied when submitting an offer.
  public type OfferDraft = {
    price : Nat;
    message : Text;
    durationDays : Nat;
  };
};
