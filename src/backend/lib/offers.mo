import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";

import Types "../types/offers";
import Common "../types/common";
import JobsTypes "../types/jobs";

module {
  /// Submit an offer from the caller for a job.
  public func submitOffer(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, Types.Offer>,
    state : { var nextOfferId : Nat },
    caller : Types.UserId,
    jobId : Types.JobId,
    draft : Types.OfferDraft,
  ) : Types.OfferId {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (job.status != #open) {
      Runtime.trap("This job is not open for offers");
    };
    if (Principal.equal(job.owner, caller)) {
      Runtime.trap("You cannot submit an offer on your own job");
    };
    if (draft.price == 0) {
      Runtime.trap("Offer price must be greater than zero");
    };
    if (draft.message.size() == 0) {
      Runtime.trap("Offer message must not be empty");
    };
    let alreadyOffered = offers.any(func(_, offer) {
      offer.jobId == jobId and Principal.equal(offer.worker, caller);
    });
    if (alreadyOffered) {
      Runtime.trap("You have already submitted an offer for this job");
    };
    let id = state.nextOfferId;
    state.nextOfferId := id + 1;
    let offer : Types.Offer = {
      id;
      jobId;
      worker = caller;
      price = draft.price;
      message = draft.message;
      durationDays = draft.durationDays;
      status = #pending;
      createdAt = Int.abs(Time.now());
    };
    offers.add(id, offer);
    id;
  };

  /// List all offers for a job (visible to the job owner).
  public func listOffersForJob(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, Types.Offer>,
    caller : Types.UserId,
    jobId : Types.JobId,
  ) : [Types.Offer] {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (not Principal.equal(job.owner, caller)) {
      Runtime.trap("Only the job owner may view all offers");
    };
    let result = offers.values().filter(func(offer) {
      offer.jobId == jobId;
    }).toArray();
    result.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  /// List the caller's own offers, optionally filtered by status.
  public func listMyOffers(
    offers : Map.Map<Common.OfferId, Types.Offer>,
    caller : Types.UserId,
    status : ?Types.OfferStatus,
  ) : [Types.Offer] {
    let result = offers.values().filter(func(offer) {
      if (not Principal.equal(offer.worker, caller)) {
        return false;
      };
      switch (status) {
        case null { true };
        case (?s) { offer.status == s };
      };
    }).toArray();
    result.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  /// Accept one offer for a job the caller owns; rejects the rest and moves the
  /// job to in-progress.
  public func acceptOffer(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, Types.Offer>,
    caller : Types.UserId,
    jobId : Types.JobId,
    offerId : Types.OfferId,
  ) : Types.Offer {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (not Principal.equal(job.owner, caller)) {
      Runtime.trap("Only the job owner may accept an offer");
    };
    if (job.status != #open) {
      Runtime.trap("This job is no longer open for offers");
    };
    let offer = offers.get(offerId)
      ?? Runtime.trap("Offer not found");
    if (offer.jobId != jobId) {
      Runtime.trap("Offer does not belong to this job");
    };

    // Collect the other offers for this job first, then reject them after the
    // iteration completes (never mutate the map while iterating it).
    let others = offers.values().filter(func(other) {
      other.jobId == jobId and other.id != offerId;
    }).toArray();
    for (other in others.values()) {
      let rejected : Types.Offer = {
        id = other.id;
        jobId = other.jobId;
        worker = other.worker;
        price = other.price;
        message = other.message;
        durationDays = other.durationDays;
        status = #rejected;
        createdAt = other.createdAt;
      };
      offers.add(other.id, rejected);
    };

    let accepted : Types.Offer = {
      id = offer.id;
      jobId = offer.jobId;
      worker = offer.worker;
      price = offer.price;
      message = offer.message;
      durationDays = offer.durationDays;
      status = #accepted;
      createdAt = offer.createdAt;
    };
    offers.add(offerId, accepted);

    let updatedJob : JobsTypes.Job = {
      id = job.id;
      owner = job.owner;
      title = job.title;
      description = job.description;
      category = job.category;
      budget = job.budget;
      location = job.location;
      dueDate = job.dueDate;
      images = job.images;
      status = #inProgress;
      acceptedOfferId = ?offerId;
      clientCompleted = false;
      workerCompleted = false;
      createdAt = job.createdAt;
      updatedAt = Int.abs(Time.now());
    };
    jobs.add(jobId, updatedJob);
    accepted;
  };

  /// Confirm completion from the caller's side; when both parties confirm the
  /// job becomes completed.
  public func confirmCompletion(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, Types.Offer>,
    caller : Types.UserId,
    jobId : Types.JobId,
  ) : Types.Offer {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (job.status != #inProgress) {
      Runtime.trap("This job is not in progress");
    };
    let offerId = job.acceptedOfferId
      ?? Runtime.trap("This job has no accepted offer");
    let offer = offers.get(offerId)
      ?? Runtime.trap("Accepted offer not found");

    let isOwner = Principal.equal(job.owner, caller);
    let isWorker = Principal.equal(offer.worker, caller);
    if (not (isOwner or isWorker)) {
      Runtime.trap("Only the client or the accepted worker may confirm completion");
    };

    let clientCompleted = if (isOwner) { true } else { job.clientCompleted };
    let workerCompleted = if (isWorker) { true } else { job.workerCompleted };
    let bothDone = clientCompleted and workerCompleted;

    let updatedJob : JobsTypes.Job = {
      id = job.id;
      owner = job.owner;
      title = job.title;
      description = job.description;
      category = job.category;
      budget = job.budget;
      location = job.location;
      dueDate = job.dueDate;
      images = job.images;
      status = if (bothDone) { #completed } else { #inProgress };
      acceptedOfferId = job.acceptedOfferId;
      clientCompleted;
      workerCompleted;
      createdAt = job.createdAt;
      updatedAt = Int.abs(Time.now());
    };
    jobs.add(jobId, updatedJob);
    offer;
  };
};
