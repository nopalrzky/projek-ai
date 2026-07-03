class PaginatedData<T> {
  final List<T> items;
  final int currentPage;
  final int lastPage;
  final int perPage;
  final int total;
  final int? from;
  final int? to;

  const PaginatedData({
    required this.items,
    required this.currentPage,
    required this.lastPage,
    required this.perPage,
    required this.total,
    this.from,
    this.to,
  });

  /// Factory that parses pagination metadata from an API response `meta` map.
  ///
  /// Reads camelCase keys as canonical; falls back to snake_case (Laravel
  /// default) for compatibility during the API migration period.
  /// Never guesses [lastPage] from [items.length].
  factory PaginatedData.fromMeta({
    required List<T> items,
    required Map<String, dynamic> meta,
    required int requestedPage,
    required int requestedPerPage,
  }) {
    int readInt(String camelKey, String snakeKey, int fallback) {
      final v = meta[camelKey] ?? meta[snakeKey];
      if (v is int) return v;
      if (v is num) return v.toInt();
      if (v is String) return int.tryParse(v) ?? fallback;
      return fallback;
    }

    return PaginatedData<T>(
      items: items,
      currentPage: readInt('currentPage', 'current_page', requestedPage),
      lastPage: readInt('lastPage', 'last_page', 1),
      perPage: readInt('perPage', 'per_page', requestedPerPage),
      total: readInt('total', 'total', items.length),
      from: meta['from'] is int ? meta['from'] as int : null,
      to: meta['to'] is int ? meta['to'] as int : null,
    );
  }

  bool get hasReachedMax => currentPage >= lastPage;
}
