/// Shared JSON converter utilities for type-safe conversions
library wash_wallet_domain_json_converters;

/// Safely converts dynamic value to int
int toInt(dynamic value) {
  if (value == null) return 0;
  if (value is int) return value;
  if (value is double) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  if (value is num) return value.toInt();
  return 0;
}

/// Safely converts dynamic value to int, returns null if value is null or invalid
int? toIntOrNull(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is double) return value.toInt();
  if (value is String) return int.tryParse(value);
  if (value is num) return value.toInt();
  return null;
}

/// Safely converts dynamic value to double
double toDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  if (value is num) return value.toDouble();
  return 0.0;
}

/// Safely converts dynamic value to double, returns null if value is null or invalid
double? toDoubleOrNull(dynamic value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  if (value is String) return double.tryParse(value);
  if (value is num) return value.toDouble();
  return null;
}

/// Safely converts dynamic value to bool
bool toBool(dynamic value, {bool defaultValue = false}) {
  if (value == null) return defaultValue;
  if (value is bool) return value;
  if (value is int) return value != 0;
  if (value is String) return value.toLowerCase() == 'true' || value == '1';
  return defaultValue;
}

/// Safely converts dynamic value to bool, returns null if value is null or invalid
bool? toBoolOrNull(dynamic value) {
  if (value == null) return null;
  if (value is bool) return value;
  if (value is int) return value != 0;
  if (value is String) return value.toLowerCase() == 'true' || value == '1';
  return null;
}

/// Safely converts dynamic value to DateTime
DateTime? toDateTime(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  if (value is String) {
    try {
      return DateTime.parse(value);
    } catch (_) {
      return null;
    }
  }
  return null;
}

/// Safely converts dynamic value to String
String toString_(dynamic value) {
  if (value == null) return '';
  if (value is String) return value;
  return value.toString();
}

/// Safely converts dynamic value to String, returns null if value is null
String? toStringOrNull(dynamic value) {
  if (value == null) return null;
  if (value is String) return value;
  return value.toString();
}

/// Safely converts list of dynamic to list of T
List<T> toList<T>(dynamic value, T Function(dynamic) converter) {
  if (value == null) return [];
  if (value is! List) return [];
  try {
    return value.map((item) => converter(item)).toList();
  } catch (_) {
    return [];
  }
}
