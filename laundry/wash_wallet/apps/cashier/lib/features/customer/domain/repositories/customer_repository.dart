import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CustomerRepository {
  Future<Result<List<Customer>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    String? phone,
    String? gender,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<Result<Customer>> getById(int id);

  Future<Result<Customer>> store({
    required int outletId,
    required String name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
  });

  Future<Result<Customer>> update({
    required int id,
    String? name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
    bool? isActive,
    int? outletId,
  });

  Future<Result<void>> destroy(int id);

  Future<Result<Customer>> storeMembershipContract({
    required int customerId,
    required int membershipPlanId,
    String? startAt,
    double? totalPaid,
  });

  Future<Result<Customer>> storeCustomerSubscription({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  });
}
