import 'package:equatable/equatable.dart';

class DiscoveryFilter extends Equatable {
  final String? query;
  final int? outletId;
  final String? outletName;
  final int? categoryId;
  final String? categoryName;
  final int? unitId;
  final String? unitName;
  final double? priceMin;
  final double? priceMax;
  final bool? freeShippingEligible;
  final bool? supportsCourier;
  final String serviceSortBy;
  final bool? isCurrentlyOpen;
  final double? minRating;
  final String? paymentMethod;

  const DiscoveryFilter({
    this.query,
    this.outletId,
    this.outletName,
    this.categoryId,
    this.categoryName,
    this.unitId,
    this.unitName,
    this.priceMin,
    this.priceMax,
    this.freeShippingEligible,
    this.supportsCourier,
    this.serviceSortBy = 'relevant',
    this.isCurrentlyOpen,
    this.minRating,
    this.paymentMethod,
  });

  bool get hasActiveFilter =>
      outletId != null ||
      categoryId != null ||
      unitId != null ||
      priceMin != null ||
      priceMax != null ||
      freeShippingEligible == true ||
      supportsCourier != null ||
      serviceSortBy != 'relevant' ||
      isCurrentlyOpen != null ||
      minRating != null ||
      paymentMethod != null;

  bool get hasQuery => query != null && query!.trim().isNotEmpty;

  DiscoveryFilter copyWith({
    String? query,
    bool clearQuery = false,
    int? outletId,
    String? outletName,
    bool clearOutlet = false,
    int? categoryId,
    String? categoryName,
    bool clearCategory = false,
    int? unitId,
    String? unitName,
    bool clearUnit = false,
    double? priceMin,
    double? priceMax,
    bool clearPrice = false,
    bool? freeShippingEligible,
    bool clearFreeShipping = false,
    bool? supportsCourier,
    bool clearSupportsCourier = false,
    String? serviceSortBy,
    bool? isCurrentlyOpen,
    bool clearIsCurrentlyOpen = false,
    double? minRating,
    bool clearMinRating = false,
    String? paymentMethod,
    bool clearPaymentMethod = false,
  }) {
    return DiscoveryFilter(
      query: clearQuery ? null : query ?? this.query,
      outletId: clearOutlet ? null : outletId ?? this.outletId,
      outletName: clearOutlet ? null : outletName ?? this.outletName,
      categoryId: clearCategory ? null : categoryId ?? this.categoryId,
      categoryName: clearCategory ? null : categoryName ?? this.categoryName,
      unitId: clearUnit ? null : unitId ?? this.unitId,
      unitName: clearUnit ? null : unitName ?? this.unitName,
      priceMin: clearPrice ? null : priceMin ?? this.priceMin,
      priceMax: clearPrice ? null : priceMax ?? this.priceMax,
      freeShippingEligible: clearFreeShipping
          ? null
          : freeShippingEligible ?? this.freeShippingEligible,
      supportsCourier: clearSupportsCourier
          ? null
          : supportsCourier ?? this.supportsCourier,
      serviceSortBy: serviceSortBy ?? this.serviceSortBy,
      isCurrentlyOpen: clearIsCurrentlyOpen
          ? null
          : isCurrentlyOpen ?? this.isCurrentlyOpen,
      minRating: clearMinRating ? null : minRating ?? this.minRating,
      paymentMethod: clearPaymentMethod
          ? null
          : paymentMethod ?? this.paymentMethod,
    );
  }

  DiscoveryFilter clearFilters() {
    return DiscoveryFilter(query: query);
  }

  @override
  List<Object?> get props => [
    query,
    outletId,
    outletName,
    categoryId,
    categoryName,
    unitId,
    unitName,
    priceMin,
    priceMax,
    freeShippingEligible,
    supportsCourier,
    serviceSortBy,
    isCurrentlyOpen,
    minRating,
    paymentMethod,
  ];
}
