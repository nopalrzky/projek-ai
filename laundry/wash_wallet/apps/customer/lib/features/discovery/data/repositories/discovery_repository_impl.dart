import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/entities/discovery_filter.dart';
import '../../domain/entities/discovery_outlet.dart';
import '../../domain/entities/discovery_search_result.dart';
import '../../domain/entities/discovery_service.dart';
import '../../domain/entities/discovery_top_service.dart';
import '../../domain/repositories/discovery_repository.dart';
import '../datasources/discovery_remote_datasource.dart';

class DiscoveryRepositoryImpl implements DiscoveryRepository {
  final DiscoveryRemoteDatasource _remoteDatasource;

  DiscoveryRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<DiscoverySearchResult>> searchServices({
    required DiscoveryFilter filter,
    int page = 1,
    int perPage = 15,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final response = await _remoteDatasource.fetchDiscoveryOutlets(
        query: filter.query,
        outletId: filter.outletId,
        categoryId: filter.categoryId,
        unitId: filter.unitId,
        priceMin: filter.priceMin,
        priceMax: filter.priceMax,
        freeShippingEligible: filter.freeShippingEligible,
        supportsCourier: filter.supportsCourier,
        serviceSortBy: filter.serviceSortBy,
        page: page,
        perPage: perPage,
        latitude: latitude,
        longitude: longitude,
      );

      final services = _sortServices(
        _applyClientFilters(_flattenServices(response.outlets), filter),
        filter.serviceSortBy,
      );

      return Result.success(
        DiscoverySearchResult(
          services: services,
          activeFilter: filter,
          correctedQuery: response.correctedQuery,
          hasReachedMax:
              response.outlets.isEmpty || response.outlets.length < perPage,
          currentPage: page,
        ),
      );
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<DiscoveryService>>> getRecommendedServices({
    required String serviceSortBy,
    bool? freeShippingEligible,
    double? latitude,
    double? longitude,
    int perPage = 10,
  }) async {
    try {
      final response = await _remoteDatasource.fetchDiscoveryOutlets(
        freeShippingEligible: freeShippingEligible,
        serviceSortBy: serviceSortBy,
        page: 1,
        perPage: perPage,
        latitude: latitude,
        longitude: longitude,
      );

      final filter = DiscoveryFilter(
        freeShippingEligible: freeShippingEligible,
        serviceSortBy: serviceSortBy,
      );
      final services = _sortServices(
        _applyClientFilters(_flattenServices(response.outlets), filter),
        serviceSortBy,
      );

      return Result.success(services.take(perPage).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<Outlet>>> getTopOutlets({
    double? latitude,
    double? longitude,
    int perPage = 5,
  }) async {
    try {
      final models = await _remoteDatasource.fetchTopOutlets(
        perPage: perPage,
        latitude: latitude,
        longitude: longitude,
      );

      final outlets = models.map((m) => m.toEntity()).toList()
        ..sort((a, b) {
          final rating = (b.averageRating ?? 0).compareTo(a.averageRating ?? 0);
          if (rating != 0) return rating;
          return (b.reviewsCount ?? 0).compareTo(a.reviewsCount ?? 0);
        });

      return Result.success(outlets.take(perPage).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<DiscoveryOutlet>>> getDiscoveryOutlets({
    double? latitude,
    double? longitude,
    int page = 1,
    int perPage = 15,
  }) async {
    try {
      final response = await _remoteDatasource.fetchDiscoveryOutlets(
        page: page,
        perPage: perPage,
        latitude: latitude,
        longitude: longitude,
      );

      return Result.success(
        response.outlets.map(_mapToDiscoveryOutlet).toList(),
      );
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  DiscoveryOutlet _mapToDiscoveryOutlet(OutletModel model) {
    final outlet = model.toEntity();
    final services = _topServicesForOutlet(outlet);

    return DiscoveryOutlet(
      id: outlet.id,
      name: outlet.name,
      shortAddress: _shortAddressForOutlet(outlet),
      fullAddress: outlet.fullAddress,
      averageRating: outlet.averageRating,
      reviewsCount: outlet.reviewsCount,
      distanceKm: outlet.distance,
      isCurrentlyOpen: outlet.isCurrentlyOpen,
      isCourierEnabled: outlet.isCourierEnabled,
      hasFreeShipping: outlet.hasFreeShipping,
      hasUnconditionalFreeShipping: outlet.hasUnconditionalFreeShipping,
      topServices: services,
    );
  }

  List<DiscoveryTopService> _topServicesForOutlet(Outlet outlet) {
    final categories = outlet.categories ?? const <Category>[];

    return categories
        .expand(
          (category) => category.laundryServices ?? const <LaundryService>[],
        )
        .where((service) => service.isActive)
        .take(9)
        .map(
          (service) => DiscoveryTopService(
            id: service.id,
            outletId: outlet.id,
            name: service.name,
            priceStartsFrom: service.price,
            unitName: service.unit?.name,
            unitSymbol: service.unit?.symbol,
            isActive: service.isActive,
            supportsCourier: service.supportsCourier && outlet.isCourierEnabled,
          ),
        )
        .toList();
  }

  String? _shortAddressForOutlet(Outlet outlet) {
    if (outlet.districtName != null &&
        outlet.districtName!.trim().isNotEmpty &&
        outlet.cityName != null &&
        outlet.cityName!.trim().isNotEmpty) {
      return '${outlet.districtName}, ${outlet.cityName}';
    }

    if (outlet.villageName != null &&
        outlet.villageName!.trim().isNotEmpty &&
        outlet.cityName != null &&
        outlet.cityName!.trim().isNotEmpty) {
      return '${outlet.villageName}, ${outlet.cityName}';
    }

    return outlet.fullAddress ?? outlet.street;
  }

  List<DiscoveryService> _flattenServices(List<OutletModel> outlets) {
    final services = <DiscoveryService>[];

    for (final outletModel in outlets) {
      final outlet = outletModel.toEntity();
      final categories = outlet.categories ?? const <Category>[];

      for (final category in categories) {
        final laundryServices =
            category.laundryServices ?? const <LaundryService>[];

        for (final service in laundryServices) {
          services.add(
            DiscoveryService(
              id: service.id,
              name: service.name,
              price: service.price,
              categoryId: service.categoryId,
              categoryName: category.name,
              unitId: service.unitId,
              unitName: service.unit?.name,
              unitSymbol: service.unit?.symbol,
              averageRating: service.averageRating,
              reviewsCount: service.reviewsCount,
              supportsCourier:
                  service.supportsCourier && outlet.isCourierEnabled,
              courierSupportLabel: service.courierSupportLabel,
              courierSupportMessage: service.courierSupportMessage,
              outletId: outlet.id,
              outletName: outlet.name,
              outletDistance: outlet.distance,
              outletIsCurrentlyOpen: outlet.isCurrentlyOpen,
              outletIsCourierEnabled: outlet.isCourierEnabled,
              outletHasFreeShipping: outlet.hasFreeShipping,
              outletHasUnconditionalFreeShipping:
                  outlet.hasUnconditionalFreeShipping,
              outletAverageRating: outlet.averageRating,
              outletReviewsCount: outlet.reviewsCount,
            ),
          );
        }
      }
    }

    return services;
  }

  List<DiscoveryService> _applyClientFilters(
    List<DiscoveryService> services,
    DiscoveryFilter filter,
  ) {
    return services.where((service) {
      if (filter.outletId != null && service.outletId != filter.outletId) {
        return false;
      }

      if (filter.categoryId != null &&
          service.categoryId != filter.categoryId) {
        return false;
      }

      if (filter.unitId != null && service.unitId != filter.unitId) {
        return false;
      }

      if (filter.priceMin != null && service.price < filter.priceMin!) {
        return false;
      }

      if (filter.priceMax != null && service.price > filter.priceMax!) {
        return false;
      }

      if (filter.freeShippingEligible == true &&
          !service.outletHasUnconditionalFreeShipping) {
        return false;
      }

      if (filter.supportsCourier == true && !service.supportsCourier) {
        return false;
      }

      return true;
    }).toList();
  }

  List<DiscoveryService> _sortServices(
    List<DiscoveryService> services,
    String serviceSortBy,
  ) {
    final sorted = [...services];

    switch (serviceSortBy) {
      case 'cheapest':
        sorted.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'nearest':
        sorted.sort((a, b) {
          final aDistance = a.outletDistance ?? double.maxFinite;
          final bDistance = b.outletDistance ?? double.maxFinite;
          return aDistance.compareTo(bDistance);
        });
        break;
      case 'best':
        sorted.sort((a, b) {
          final rating = (b.averageRating ?? b.outletAverageRating ?? 0)
              .compareTo(a.averageRating ?? a.outletAverageRating ?? 0);
          if (rating != 0) return rating;
          return (b.reviewsCount ?? b.outletReviewsCount ?? 0).compareTo(
            a.reviewsCount ?? a.outletReviewsCount ?? 0,
          );
        });
        break;
      case 'popular':
        sorted.sort((a, b) {
          final reviews = (b.reviewsCount ?? b.outletReviewsCount ?? 0)
              .compareTo(a.reviewsCount ?? a.outletReviewsCount ?? 0);
          if (reviews != 0) return reviews;
          return (b.averageRating ?? b.outletAverageRating ?? 0).compareTo(
            a.averageRating ?? a.outletAverageRating ?? 0,
          );
        });
        break;
      default:
        break;
    }

    return sorted;
  }

  Failure _mapExceptionToFailure(Object exception) {
    if (exception is NetworkException) {
      return NetworkFailure(message: exception.message);
    }

    if (exception is ApiException) {
      switch (exception.statusCode) {
        case 400:
        case 422:
          return ValidationFailure(
            message: exception.message,
            errors: exception.errors,
          );
        case 401:
        case 403:
          return AuthFailure(message: exception.message);
        case 404:
          return ServerFailure(message: exception.message, statusCode: 404);
        default:
          return ServerFailure(
            message: exception.message,
            statusCode: exception.statusCode,
          );
      }
    }

    return ServerFailure(message: exception.toString());
  }
}
