import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CustomerSubscriptionRepository {
  Future<Result<List<CustomerSubscription>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? customerId,
    int? servicePackageId,
    String? minPurchaseDate,
    String? maxPurchaseDate,
    String? expiryAtFrom,
    String? expiryAtTo,
    double? minPricePaid,
    double? maxPricePaid,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    int? outletId,
  });

  Future<Result<CustomerSubscription>> getById(int id);

  Future<Result<CustomerSubscription>> store({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  });

  Future<Result<CustomerSubscription>> update({
    required int id,
    String? status,
    String? note,
  });

  Future<Result<void>> destroy(int id);

  Future<Result<List<CustomerSubscription>>> getByCustomerId({
    required int customerId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<Result<List<CustomerSubscription>>> getByOutletId({
    required int outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });
}
