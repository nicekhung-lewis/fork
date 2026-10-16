import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type UserRole = Common.UserRole;

  /// A user's public profile. `avatar` is an object-storage blob reference
  /// (uploaded through the platform file storage) or null when unset.
  public type Profile = {
    id : UserId;
    displayName : Text;
    avatar : ?Blob;
    bio : Text;
    serviceArea : Text;
    skills : [Text];
    activeRole : UserRole;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Aggregate reputation shown on the public profile.
  public type ProfileStats = {
    averageRating : Float; // 0.0 when no reviews yet
    reviewCount : Nat;
    completedJobs : Nat;
  };

  /// Public profile view: profile plus reputation aggregates.
  public type PublicProfile = {
    profile : Profile;
    stats : ProfileStats;
  };

  /// Editable profile fields. `null` means "leave unchanged".
  public type ProfileUpdate = {
    displayName : ?Text;
    avatar : ?Blob;
    bio : ?Text;
    serviceArea : ?Text;
    skills : ?[Text];
  };
};
