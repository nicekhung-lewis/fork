/// OQL value instance for `?Blob`: `null` renders as `#null_`, `?b` through the
/// Blob text rendering. Needed by manual `.payload` fields whose extract
/// returns an optional Blob.
import OQLTypes "mo:caffeineai-oql/Types";
import BlobValue "mo:caffeineai-oql/BlobValue";

module {
  public func _toRow(self : ?Blob) : OQLTypes.Value =
    switch (self) {
      case (?b) b._toRow();
      case null #null_;
    };
};
