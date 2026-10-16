import Map "mo:core/Map";

import Types "../types/offers";
import Common "../types/common";
import JobsTypes "../types/jobs";
import OffersLib "../lib/offers";

mixin (
  jobs : Map.Map<Common.JobId, JobsTypes.Job>,
  offers : Map.Map<Common.OfferId, Types.Offer>,
  state : { var nextOfferId : Nat },
) {
  /// Submit an offer from the caller for a job.
  public shared ({ caller }) func submitOffer(jobId : Types.JobId, draft : Types.OfferDraft) : async Types.OfferId {
    OffersLib.submitOffer(jobs, offers, state, caller, jobId, draft);
  };

  /// List all offers for a job (visible to the job owner).
  public query ({ caller }) func listOffersForJob(jobId : Types.JobId) : async [Types.Offer] {
    OffersLib.listOffersForJob(jobs, offers, caller, jobId);
  };

  /// List the caller's own offers, optionally filtered by status.
  public query ({ caller }) func listMyOffers(status : ?Types.OfferStatus) : async [Types.Offer] {
    OffersLib.listMyOffers(offers, caller, status);
  };

  /// Accept one offer for a job the caller owns; rejects the rest and moves the
  /// job to in-progress.
  public shared ({ caller }) func acceptOffer(jobId : Types.JobId, offerId : Types.OfferId) : async Types.Offer {
    OffersLib.acceptOffer(jobs, offers, caller, jobId, offerId);
  };

  /// Confirm completion from the caller's side; when both parties confirm the
  /// job becomes completed.
  public shared ({ caller }) func confirmCompletion(jobId : Types.JobId) : async Types.Offer {
    OffersLib.confirmCompletion(jobs, offers, caller, jobId);
  };
};
