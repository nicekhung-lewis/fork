import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";

import Types "../types/messages";
import Common "../types/common";
import JobsTypes "../types/jobs";
import OffersTypes "../types/offers";

module {
  /// True when `caller` is a participant of the job thread: the job owner or
  /// the worker whose offer was accepted.
  func isParticipant(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
    caller : Types.UserId,
    jobId : Types.JobId,
  ) : Bool {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (Principal.equal(job.owner, caller)) {
      return true;
    };
    switch (job.acceptedOfferId) {
      case null { false };
      case (?offerId) {
        switch (offers.get(offerId)) {
          case null { false };
          case (?offer) { Principal.equal(offer.worker, caller) };
        };
      };
    };
  };

  /// Send a chat message in a job thread (client or accepted worker only).
  public func sendMessage(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
    messages : Map.Map<Common.MessageId, Types.Message>,
    state : { var nextMessageId : Nat },
    caller : Types.UserId,
    jobId : Types.JobId,
    body : Text,
  ) : Types.MessageId {
    if (not isParticipant(jobs, offers, caller, jobId)) {
      Runtime.trap("Only the client and the accepted worker may message in this job");
    };
    if (body.size() == 0) {
      Runtime.trap("Message must not be empty");
    };
    let id = state.nextMessageId;
    state.nextMessageId := id + 1;
    let message : Types.Message = {
      id;
      jobId;
      sender = caller;
      body;
      createdAt = Int.abs(Time.now());
    };
    messages.add(id, message);
    id;
  };

  /// List the messages of a job thread (participants only).
  public func listMessages(
    jobs : Map.Map<Common.JobId, JobsTypes.Job>,
    offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
    messages : Map.Map<Common.MessageId, Types.Message>,
    caller : Types.UserId,
    jobId : Types.JobId,
  ) : [Types.Message] {
    if (not isParticipant(jobs, offers, caller, jobId)) {
      Runtime.trap("Only the client and the accepted worker may read this job thread");
    };
    let result = messages.values().filter(func(message) {
      message.jobId == jobId;
    }).toArray();
    result.sort(func(a, b) = if (a.createdAt < b.createdAt) { #less } else if (a.createdAt > b.createdAt) { #greater } else { #equal });
  };
};
