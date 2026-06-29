import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OutletRepository {
  Future<Result<List<Outlet>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isExposure,
    String? status,
    int? provinceId,
    int? cityId,
    int? districtId,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    double? latitude,
    double? longitude,
  });

  Future<Result<List<Outlet>>> getNearby({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int perPage = 15,
    String? search,
  });

  Future<Result<Outlet>> getById({
    required int id,
    double? latitude,
    double? longitude,
  });

  Future<Result<List<OrderReview>>> getReviews({
    required int outletId,
    int page = 1,
    int perPage = 10,
  });

  Future<Result<OutletReviewSummary>> getReviewSummary({required int outletId});
}
