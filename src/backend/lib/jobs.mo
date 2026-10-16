import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";

import Types "../types/jobs";
import Common "../types/common";
import OffersTypes "../types/offers";

module {
  /// Create a job owned by the caller; returns the new job id.
  public func createJob(
    jobs : Map.Map<Common.JobId, Types.Job>,
    state : { var nextJobId : Nat },
    caller : Types.UserId,
    draft : Types.JobDraft,
  ) : Types.JobId {
    if (draft.title.size() == 0) {
      Runtime.trap("Job title must not be empty");
    };
    if (draft.budget.min > draft.budget.max) {
      Runtime.trap("Budget minimum must not exceed maximum");
    };
    let now = Int.abs(Time.now());
    let id = state.nextJobId;
    state.nextJobId := id + 1;
    let job : Types.Job = {
      id;
      owner = caller;
      title = draft.title;
      description = draft.description;
      category = draft.category;
      budget = draft.budget;
      location = draft.location;
      dueDate = draft.dueDate;
      images = draft.images;
      status = #open;
      acceptedOfferId = null;
      clientCompleted = false;
      workerCompleted = false;
      createdAt = now;
      updatedAt = now;
    };
    jobs.add(id, job);
    id;
  };

  /// Edit a job the caller owns.
  public func updateJob(
    jobs : Map.Map<Common.JobId, Types.Job>,
    caller : Types.UserId,
    jobId : Types.JobId,
    update : Types.JobUpdate,
  ) : Types.Job {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (not Principal.equal(job.owner, caller)) {
      Runtime.trap("Only the job owner may edit this job");
    };
    let title = update.title ?? job.title;
    if (title.size() == 0) {
      Runtime.trap("Job title must not be empty");
    };
    let budget = update.budget ?? job.budget;
    if (budget.min > budget.max) {
      Runtime.trap("Budget minimum must not exceed maximum");
    };
    let updated : Types.Job = {
      id = job.id;
      owner = job.owner;
      title;
      description = update.description ?? job.description;
      category = update.category ?? job.category;
      budget;
      location = update.location ?? job.location;
      dueDate = switch (update.dueDate) {
        case (?d) { ?d };
        case null { job.dueDate };
      };
      images = update.images ?? job.images;
      status = job.status;
      acceptedOfferId = job.acceptedOfferId;
      clientCompleted = job.clientCompleted;
      workerCompleted = job.workerCompleted;
      createdAt = job.createdAt;
      updatedAt = Int.abs(Time.now());
    };
    jobs.add(jobId, updated);
    updated;
  };

  /// Close a job the caller owns (no longer accepting offers).
  public func closeJob(
    jobs : Map.Map<Common.JobId, Types.Job>,
    caller : Types.UserId,
    jobId : Types.JobId,
  ) : Types.Job {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (not Principal.equal(job.owner, caller)) {
      Runtime.trap("Only the job owner may close this job");
    };
    let updated : Types.Job = {
      id = job.id;
      owner = job.owner;
      title = job.title;
      description = job.description;
      category = job.category;
      budget = job.budget;
      location = job.location;
      dueDate = job.dueDate;
      images = job.images;
      status = #closed;
      acceptedOfferId = job.acceptedOfferId;
      clientCompleted = job.clientCompleted;
      workerCompleted = job.workerCompleted;
      createdAt = job.createdAt;
      updatedAt = Int.abs(Time.now());
    };
    jobs.add(jobId, updated);
    updated;
  };

  /// Delete a job the caller owns.
  public func deleteJob(
    jobs : Map.Map<Common.JobId, Types.Job>,
    caller : Types.UserId,
    jobId : Types.JobId,
  ) : () {
    let job = jobs.get(jobId)
      ?? Runtime.trap("Job not found");
    if (not Principal.equal(job.owner, caller)) {
      Runtime.trap("Only the job owner may delete this job");
    };
    jobs.remove(jobId);
  };

  /// List the caller's own jobs, optionally filtered by status.
  public func listMyJobs(
    jobs : Map.Map<Common.JobId, Types.Job>,
    caller : Types.UserId,
    status : ?Types.JobStatus,
  ) : [Types.Job] {
    let result = jobs.values().filter(func(job) {
      if (not Principal.equal(job.owner, caller)) {
        return false;
      };
      switch (status) {
        case null { true };
        case (?s) { job.status == s };
      };
    }).toArray();
    result.sort(func(a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  /// Public job detail including its offers.
  public func getJobDetail(
    jobs : Map.Map<Common.JobId, Types.Job>,
    jobId : Types.JobId,
  ) : ?Types.Job {
    jobs.get(jobId);
  };

  /// Search open jobs with keyword / category / budget / location filters and sort.
  public func searchJobs(
    jobs : Map.Map<Common.JobId, Types.Job>,
    filter : Types.JobFilter,
  ) : Types.JobPage {
    let keyword = switch (filter.keyword) {
      case null { null };
      case (?k) {
        let trimmed = k.toLower();
        if (trimmed.size() == 0) { null } else { ?trimmed };
      };
    };
    let location = switch (filter.location) {
      case null { null };
      case (?l) {
        let trimmed = l.toLower();
        if (trimmed.size() == 0) { null } else { ?trimmed };
      };
    };

    let matched = jobs.values().filter(func(job) {
      if (job.status != #open) {
        return false;
      };
      switch (filter.category) {
        case null {};
        case (?c) {
          if (job.category != c) {
            return false;
          };
        };
      };
      switch (filter.minBudget) {
        case null {};
        case (?min) {
          if (job.budget.max < min) {
            return false;
          };
        };
      };
      switch (filter.maxBudget) {
        case null {};
        case (?max) {
          if (job.budget.min > max) {
            return false;
          };
        };
      };
      switch (location) {
        case null {};
        case (?loc) {
          if (not job.location.toLower().contains(#text loc)) {
            return false;
          };
        };
      };
      switch (keyword) {
        case null {};
        case (?kw) {
          let inTitle = job.title.toLower().contains(#text kw);
          let inDescription = job.description.toLower().contains(#text kw);
          if (not (inTitle or inDescription)) {
            return false;
          };
        };
      };
      true;
    }).toArray();

    let sorted = matched.sort(func(a, b) {
      switch (filter.sort) {
        case (#newest) {
          if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal };
        };
        case (#highestBudget) {
          if (a.budget.max > b.budget.max) { #less } else if (a.budget.max < b.budget.max) { #greater } else { #equal };
        };
      };
    });

    { jobs = sorted; total = sorted.size() };
  };
};
