import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/service_package_repository.dart';

class GetAllUsecase {
  final ServicePackageRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<PaginatedData<ServicePackage>>> call(GetAllParams params) {
    return _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      outletId: params.outletId,
      isActive: params.isActive,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      minValidityDays: params.minValidityDays,
      maxValidityDays: params.maxValidityDays,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}

class GetAllParams extends Equatable {
  final int page;
  final int perPage;
  final String? search;
  final int? outletId;
  final bool? isActive;
  final double? minPrice;
  final double? maxPrice;
  final int? minValidityDays;
  final int? maxValidityDays;
  final String sortBy;
  final String sortDirection;

  const GetAllParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.outletId,
    this.isActive,
    this.minPrice,
    this.maxPrice,
    this.minValidityDays,
    this.maxValidityDays,
    this.sortBy = 'createdAt',
    this.sortDirection = 'desc',
  });

  @override
  List<Object?> get props => [
    page,
    perPage,
    search,
    outletId,
    isActive,
    minPrice,
    maxPrice,
    minValidityDays,
    maxValidityDays,
    sortBy,
    sortDirection,
  ];
}
