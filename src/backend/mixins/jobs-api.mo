import Map "mo:core/Map";

import Types "../types/jobs";
import Common "../types/common";
import JobsLib "../lib/jobs";

mixin (
  jobs : Map.Map<Common.JobId, Types.Job>,
  state : { var nextJobId : Nat },
) {
  /// Create a job owned by the caller; returns the new job id.
  public shared ({ caller }) func createJob(draft : Types.JobDraft) : async Types.JobId {
    JobsLib.createJob(jobs, state, caller, draft);
  };

  /// Edit a job the caller owns.
  public shared ({ caller }) func updateJob(jobId : Types.JobId, update : Types.JobUpdate) : async Types.Job {
    JobsLib.updateJob(jobs, caller, jobId, update);
  };

  /// Close a job the caller owns.
  public shared ({ caller }) func closeJob(jobId : Types.JobId) : async Types.Job {
    JobsLib.closeJob(jobs, caller, jobId);
  };

  /// Delete a job the caller owns.
  public shared ({ caller }) func deleteJob(jobId : Types.JobId) : async () {
    JobsLib.deleteJob(jobs, caller, jobId);
  };

  /// List the caller's own jobs, optionally filtered by status.
  public query ({ caller }) func listMyJobs(status : ?Types.JobStatus) : async [Types.Job] {
    JobsLib.listMyJobs(jobs, caller, status);
  };

  /// Public job detail including its offers.
  public query func getJobDetail(jobId : Types.JobId) : async ?Types.Job {
    JobsLib.getJobDetail(jobs, jobId);
  };

  /// Search open jobs with keyword / category / budget / location filters and sort.
  public query func searchJobs(filter : Types.JobFilter) : async Types.JobPage {
    JobsLib.searchJobs(jobs, filter);
  };
};
