import Map "mo:core/Map";
import Principal "mo:core/Principal";

import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import OqlOptNatValue "OqlOptNatValue";
import OqlOptBlobValue "OqlOptBlobValue";
import OfferStatusValue "OfferStatusValue";

import Common "types/common";
import ProfilesTypes "types/profiles";
import JobsTypes "types/jobs";
import OffersTypes "types/offers";
import MessagesTypes "types/messages";
import ReviewsTypes "types/reviews";

import ProfilesApi "mixins/profiles-api";
import JobsApi "mixins/jobs-api";
import OffersApi "mixins/offers-api";
import MessagesApi "mixins/messages-api";
import ReviewsApi "mixins/reviews-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let profiles : Map.Map<Common.UserId, ProfilesTypes.Profile>;
  let jobs : Map.Map<Common.JobId, JobsTypes.Job>;
  let offers : Map.Map<Common.OfferId, OffersTypes.Offer>;
  let messages : Map.Map<Common.MessageId, MessagesTypes.Message>;
  let reviews : Map.Map<Common.ReviewId, ReviewsTypes.Review>;

  let jobState : { var nextJobId : Nat };
  let offerState : { var nextOfferId : Nat };
  let messageState : { var nextMessageId : Nat };
  let reviewState : { var nextReviewId : Nat };

  include MixinAuthorization(accessControlState, null);

  include ProfilesApi(profiles, jobs, offers, reviews);
  include JobsApi(jobs, jobState);
  include OffersApi(jobs, offers, offerState);
  include MessagesApi(jobs, offers, messages, messageState);
  include ReviewsApi(jobs, offers, reviews, reviewState);

  include ApiDocMixin();

  // OQL entities. Each table is derived from the corresponding Motoko record
  // type in `types/`. Authorization is per entity:
  //   - profiles / jobs / reviews: public marketplace data, world-readable.
  //   - offers / messages: private negotiation and chat, controller-only.
  include Expose({
    entities = [
      profiles.toEntityManual("profile", "Profile", "id")
        .sample({
          id = Principal.fromText("aaaaa-aa");
          displayName = "";
          avatar = ?("" : Blob);
          bio = "";
          serviceArea = "";
          skills = [];
          activeRole = #client;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func p = p.id)
        .payload("displayName", func p = p.displayName)
        .payload("avatar", func p = p.avatar)
        .payload("bio", func p = p.bio)
        .payload("serviceArea", func p = p.serviceArea)
        .payload("skills", func p = p.skills.values().join(", "))
        .payload(
          "activeRole",
          func p = switch (p.activeRole) { case (#client) "client"; case (#worker) "worker" },
        )
        .payload("createdAt", func p = p.createdAt)
        .payload("updatedAt", func p = p.updatedAt)
        .public_()
        .build(),
      jobs.toEntityManual("job", "Job", "id")
        .sample({
          id = 0;
          owner = Principal.fromText("aaaaa-aa");
          title = "";
          description = "";
          category = #other;
          budget = { min = 0; max = 0 };
          location = "";
          dueDate = ?0;
          images = [];
          status = #open;
          acceptedOfferId = ?0;
          clientCompleted = false;
          workerCompleted = false;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func j = j.id)
        .payload("owner", func j = j.owner)
        .payload("title", func j = j.title)
        .payload("description", func j = j.description)
        .payload(
          "category",
          func j = switch (j.category) {
            case (#cleaning) "cleaning";
            case (#handyman) "handyman";
            case (#delivery) "delivery";
            case (#assembly) "assembly";
            case (#gardening) "gardening";
            case (#moving) "moving";
            case (#tutoring) "tutoring";
            case (#design) "design";
            case (#webDevelopment) "webDevelopment";
            case (#photography) "photography";
            case (#events) "events";
            case (#other) "other";
          },
        )
        .flatten(func j = j.budget)
        .payload("location", func j = j.location)
        .payload("dueDate", func j = j.dueDate)
        .payload("imageCount", func j = j.images.size())
        .payload(
          "status",
          func j = switch (j.status) {
            case (#open) "open";
            case (#inProgress) "inProgress";
            case (#completed) "completed";
            case (#closed) "closed";
          },
        )
        .payload("acceptedOfferId", func j = j.acceptedOfferId)
        .payload("clientCompleted", func j = j.clientCompleted)
        .payload("workerCompleted", func j = j.workerCompleted)
        .payload("createdAt", func j = j.createdAt)
        .payload("updatedAt", func j = j.updatedAt)
        .public_()
        .build(),
      offers.toEntity("offer", "Offer", "id")
        .sample({
          id = 0;
          jobId = 0;
          worker = Principal.fromText("aaaaa-aa");
          price = 0;
          message = "";
          durationDays = 0;
          status = #pending;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      messages.toEntity("message", "Message", "id")
        .sample({
          id = 0;
          jobId = 0;
          sender = Principal.fromText("aaaaa-aa");
          body = "";
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      reviews.toEntity("review", "Review", "id")
        .sample({
          id = 0;
          jobId = 0;
          author = Principal.fromText("aaaaa-aa");
          subject = Principal.fromText("aaaaa-aa");
          rating = 0;
          comment = "";
          createdAt = 0;
        })
        .public_()
        .build(),
    ];
  });
};
