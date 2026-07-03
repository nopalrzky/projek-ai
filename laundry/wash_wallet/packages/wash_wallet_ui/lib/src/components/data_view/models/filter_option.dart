/// Represents a selectable option for a filter.
class FilterOption {
  /// Unique identifier for this option.
  final String id;

  /// Label to display.
  final String label;

  /// The underlying value.
  final dynamic value;

  const FilterOption({
    required this.id,
    required this.label,
    required this.value,
  });
}
