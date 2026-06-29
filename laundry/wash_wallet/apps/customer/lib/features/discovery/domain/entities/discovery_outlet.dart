import 'package:equatable/equatable.dart';

import 'discovery_top_service.dart';

class DiscoveryOutlet extends Equatable {
  final int id;
  final String name;
  final String? thumbnailUrl;
  final String? shortAddress;
  final String? fullAddress;
  final double? averageRating;
  final int? reviewsCount;
  final double? distanceKm;
  final bool isCurrentlyOpen;
  final bool isCourierEnabled;
  final bool hasFreeShipping;
  final bool hasUnconditionalFreeShipping;
  final List<DiscoveryTopService> topServices;

  const DiscoveryOutlet({
    required this.id,
    required this.name,
    this.thumbnailUrl,
    this.shortAddress,
    this.fullAddress,
    this.averageRating,
    this.reviewsCount,
    this.distanceKm,
    required this.isCurrentlyOpen,
    required this.isCourierEnabled,
    required this.hasFreeShipping,
    required this.hasUnconditionalFreeShipping,
    required this.topServices,
  });

  @override
  List<Object?> get props => [
    id,
    name,
    thumbnailUrl,
    shortAddress,
    fullAddress,
    averageRating,
    reviewsCount,
    distanceKm,
    isCurrentlyOpen,
    isCourierEnabled,
    hasFreeShipping,
    hasUnconditionalFreeShipping,
    topServices,
  ];
}
