import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    profiles : Map.Map<Principal, Profile>;
    jobs : Map.Map<Nat, Job>;
    offers : Map.Map<Nat, Offer>;
    messages : Map.Map<Nat, Message>;
    reviews : Map.Map<Nat, Review>;
    jobState : { var nextJobId : Nat };
    offerState : { var nextOfferId : Nat };
    messageState : { var nextMessageId : Nat };
    reviewState : { var nextReviewId : Nat };
  };

  type Profile = {
    id : Principal;
    displayName : Text;
    avatar : ?Blob;
    bio : Text;
    serviceArea : Text;
    skills : [Text];
    activeRole : { #client; #worker };
    createdAt : Nat;
    updatedAt : Nat;
  };

  type Job = {
    id : Nat;
    owner : Principal;
    title : Text;
    description : Text;
    category : {
      #cleaning;
      #handyman;
      #delivery;
      #assembly;
      #gardening;
      #moving;
      #tutoring;
      #design;
      #webDevelopment;
      #photography;
      #events;
      #other;
    };
    budget : { min : Nat; max : Nat };
    location : Text;
    dueDate : ?Nat;
    images : [Blob];
    status : { #open; #inProgress; #completed; #closed };
    acceptedOfferId : ?Nat;
    clientCompleted : Bool;
    workerCompleted : Bool;
    createdAt : Nat;
    updatedAt : Nat;
  };

  type Offer = {
    id : Nat;
    jobId : Nat;
    worker : Principal;
    price : Nat;
    message : Text;
    durationDays : Nat;
    status : { #pending; #accepted; #rejected };
    createdAt : Nat;
  };

  type Message = {
    id : Nat;
    jobId : Nat;
    sender : Principal;
    body : Text;
    createdAt : Nat;
  };

  type Review = {
    id : Nat;
    jobId : Nat;
    author : Principal;
    subject : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Nat;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      profiles = Map.empty();
      jobs = Map.empty();
      offers = Map.empty();
      messages = Map.empty();
      reviews = Map.empty();
      jobState = { var nextJobId = 0 };
      offerState = { var nextOfferId = 0 };
      messageState = { var nextMessageId = 0 };
      reviewState = { var nextReviewId = 0 };
    };
  };
};
