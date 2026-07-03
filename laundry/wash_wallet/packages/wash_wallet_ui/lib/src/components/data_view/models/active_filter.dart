/// Represents a currently active filter applied to a DataView.
class ActiveFilter {
  /// The ID of the corresponding [FilterConfig].
  final String filterId;

  /// The label of the filter (e.g., 'Status').
  final String filterLabel;

  /// The display text for the selected value (e.g., 'Selesai').
  final String valueLabel;

  /// The actual value applied.
  final dynamic value;

  const ActiveFilter({
    required this.filterId,
    required this.filterLabel,
    required this.valueLabel,
    required this.value,
  });
}
