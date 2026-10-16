/// OQL value instance for `?Nat`: `null` renders as `#null_`, `?n` as `#nat n`.
/// Needed by manual `.payload` fields whose extract returns an optional Nat
/// (the compiler's built-in option instance only applies to auto-derivation).
import OQLTypes "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Nat) : OQLTypes.Value =
    switch (self) {
      case (?n) #nat n;
      case null #null_;
    };
};
