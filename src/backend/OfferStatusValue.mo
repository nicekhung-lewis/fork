/// OQL value instance for `Common.OfferStatus`: renders the variant as its
/// tag text so the `Offer` record can auto-derive through `Entity.new`.
import OQLTypes "mo:caffeineai-oql/Types";
import Common "types/common";

module {
  public func _toRow(self : Common.OfferStatus) : OQLTypes.Value =
    #text(
      switch (self) {
        case (#pending) "pending";
        case (#accepted) "accepted";
        case (#rejected) "rejected";
      }
    );
};
