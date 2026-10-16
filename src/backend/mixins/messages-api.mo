import Map "mo:core/Map";

import Types "../types/messages";
import Common "../types/common";
import JobsTypes "../types/jobs";
import OffersTypes "../types/offers";
import MessagesLib "../lib/messages";

mixin (
  jobs : Map.Map<Common.JobId, JobsTypes.Job>,
  offers : Map.Map<Common.OfferId, OffersTypes.Offer>,
  messages : Map.Map<Common.MessageId, Types.Message>,
  state : { var nextMessageId : Nat },
) {
  /// Send a chat message in a job thread (client or accepted worker only).
  public shared ({ caller }) func sendMessage(jobId : Types.JobId, body : Text) : async Types.MessageId {
    MessagesLib.sendMessage(jobs, offers, messages, state, caller, jobId, body);
  };

  /// List the messages of a job thread (participants only).
  public query ({ caller }) func listMessages(jobId : Types.JobId) : async [Types.Message] {
    MessagesLib.listMessages(jobs, offers, messages, caller, jobId);
  };
};
