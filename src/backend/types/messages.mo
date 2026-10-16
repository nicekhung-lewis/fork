import Common "common";

module {
  public type UserId = Common.UserId;
  public type JobId = Common.JobId;
  public type MessageId = Common.MessageId;
  public type Timestamp = Common.Timestamp;

  /// A chat message inside a job thread between the client and the accepted
  /// worker.
  public type Message = {
    id : MessageId;
    jobId : JobId;
    sender : UserId;
    body : Text;
    createdAt : Timestamp;
  };
};
