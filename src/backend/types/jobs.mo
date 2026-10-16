import Common "common";

module {
  public type UserId = Common.UserId;
  public type JobId = Common.JobId;
  public type Timestamp = Common.Timestamp;
  public type JobStatus = Common.JobStatus;
  public type Category = Common.Category;
  public type PriceRange = Common.PriceRange;
  public type JobSort = Common.JobSort;

  /// A job posting created by a client.
  public type Job = {
    id : JobId;
    owner : UserId;
    title : Text;
    description : Text;
    category : Category;
    budget : PriceRange;
    location : Text;
    dueDate : ?Timestamp;
    images : [Blob];
    status : JobStatus;
    acceptedOfferId : ?Nat;
    clientCompleted : Bool;
    workerCompleted : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Fields supplied when creating a job.
  public type JobDraft = {
    title : Text;
    description : Text;
    category : Category;
    budget : PriceRange;
    location : Text;
    dueDate : ?Timestamp;
    images : [Blob];
  };

  /// Editable job fields. `null` means "leave unchanged".
  public type JobUpdate = {
    title : ?Text;
    description : ?Text;
    category : ?Category;
    budget : ?PriceRange;
    location : ?Text;
    dueDate : ?Timestamp;
    images : ?[Blob];
  };

  /// Search / filter criteria. All fields optional; `null` means "no filter".
  public type JobFilter = {
    keyword : ?Text;
    category : ?Category;
    minBudget : ?Nat;
    maxBudget : ?Nat;
    location : ?Text;
    sort : JobSort;
  };

  /// A page of job results.
  public type JobPage = {
    jobs : [Job];
    total : Nat;
  };
};
