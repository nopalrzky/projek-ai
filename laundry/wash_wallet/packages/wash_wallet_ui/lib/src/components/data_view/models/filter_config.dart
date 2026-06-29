import 'filter_option.dart';

/// Types of filters supported by the DataView.
enum FilterType { 
  singleSelect, 
  multiSelect, 
  dateRange, 
  numberRange, 
  textInput 
}

/// Defines a filter configuration for the DataView.
class FilterConfig {
  /// Unique identifier for this filter.
  final String id;
  
  /// Label to display for this filter.
  final String label;
  
  /// The type of filter input.
  final FilterType type;
  
  /// Options for [FilterType.singleSelect] and [FilterType.multiSelect].
  final List<FilterOption> options;
  
  /// If true, this filter might be marked as "coming soon" or not enforced.
  final bool optional;

  const FilterConfig({
    required this.id,
    required this.label,
    required this.type,
    this.options = const [],
    this.optional = false,
  });
}
