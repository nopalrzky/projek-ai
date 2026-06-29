class OutletDistanceFormatter {
  const OutletDistanceFormatter._();

  static String? format(double? distanceKm) {
    if (distanceKm == null || distanceKm.isNaN || distanceKm < 0) {
      return null;
    }

    if (distanceKm < 1) {
      return '${(distanceKm * 1000).round()}m';
    }

    return '${distanceKm.toStringAsFixed(1)}km';
  }
}
