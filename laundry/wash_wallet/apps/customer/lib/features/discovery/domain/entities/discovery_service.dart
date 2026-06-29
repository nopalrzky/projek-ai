import 'package:equatable/equatable.dart';

class DiscoveryService extends Equatable {
  final int id;
  final String name;
  final double price;
  final int categoryId;
  final String? categoryName;
  final int unitId;
  final String? unitName;
  final String? unitSymbol;
  final double? averageRating;
  final int? reviewsCount;
  final bool supportsCourier;
  final String? courierSupportLabel;
  final String? courierSupportMessage;
  final int outletId;
  final String outletName;
  final double? outletDistance;
  final bool outletIsCurrentlyOpen;
  final bool outletIsCourierEnabled;
  final bool outletHasFreeShipping;
  final bool outletHasUnconditionalFreeShipping;
  final double? outletAverageRating;
  final int? outletReviewsCount;

  const DiscoveryService({
    required this.id,
    required this.name,
    required this.price,
    required this.categoryId,
    required this.unitId,
    required this.supportsCourier,
    required this.outletId,
    required this.outletName,
    required this.outletIsCurrentlyOpen,
    required this.outletIsCourierEnabled,
    required this.outletHasFreeShipping,
    required this.outletHasUnconditionalFreeShipping,
    this.categoryName,
    this.unitName,
    this.unitSymbol,
    this.averageRating,
    this.reviewsCount,
    this.courierSupportLabel,
    this.courierSupportMessage,
    this.outletDistance,
    this.outletAverageRating,
    this.outletReviewsCount,
  });

  @override
  List<Object?> get props => [
    id,
    name,
    price,
    categoryId,
    categoryName,
    unitId,
    unitName,
    unitSymbol,
    averageRating,
    reviewsCount,
    supportsCourier,
    courierSupportLabel,
    courierSupportMessage,
    outletId,
    outletName,
    outletDistance,
    outletIsCurrentlyOpen,
    outletIsCourierEnabled,
    outletHasFreeShipping,
    outletHasUnconditionalFreeShipping,
    outletAverageRating,
    outletReviewsCount,
  ];
}
