import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/membership_plan_repository.dart';

class GetAllParams {
  final int page;
  final int perPage;
  final String? search;
  final int? outletId;
  final bool? isActive;
  final double? minPrice;
  final double? maxPrice;
  final int? minDurationDays;
  final int? maxDurationDays;
  final double? minDiscountPercentage;
  final double? maxDiscountPercentage;
  final String sortBy;
  final String sortOrder;

  const GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.outletId,
    this.isActive,
    this.minPrice,
    this.maxPrice,
    this.minDurationDays,
    this.maxDurationDays,
    this.minDiscountPercentage,
    this.maxDiscountPercentage,
    this.sortBy = 'createdAt',
    this.sortOrder = 'desc',
  });
}

class GetAllUsecase {
  final MembershipPlanRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<MembershipPlan>>> call(
    GetAllParams params,
  ) async {
    return await _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      outletId: params.outletId,
      isActive: params.isActive,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      minDurationDays: params.minDurationDays,
      maxDurationDays: params.maxDurationDays,
      minDiscountPercentage: params.minDiscountPercentage,
      maxDiscountPercentage: params.maxDiscountPercentage,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    );
  }
}
