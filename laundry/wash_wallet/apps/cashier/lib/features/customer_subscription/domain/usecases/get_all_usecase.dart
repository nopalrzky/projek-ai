import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_subscription_repository.dart';

class GetAllUsecase {
  final CustomerSubscriptionRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<CustomerSubscription>>> call(
    GetCustomerSubscriptionsParams params,
  ) {
    return _repository.getAll(
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      status: params.status,
      customerId: params.customerId,
      outletId: params.outletId,
      servicePackageId: params.servicePackageId,
      minPurchaseDate: params.minPurchaseDate,
      maxPurchaseDate: params.maxPurchaseDate,
      expiryAtFrom: params.expiryAtFrom,
      expiryAtTo: params.expiryAtTo,
      minPricePaid: params.minPricePaid,
      maxPricePaid: params.maxPricePaid,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}

class GetCustomerSubscriptionsParams extends Equatable {
  final int page;
  final int perPage;
  final String? search;
  final String? status;
  final int? customerId;
  final int? outletId;
  final int? servicePackageId;
  final String? minPurchaseDate;
  final String? maxPurchaseDate;
  final String? expiryAtFrom;
  final String? expiryAtTo;
  final double? minPricePaid;
  final double? maxPricePaid;
  final String sortBy;
  final String sortDirection;

  const GetCustomerSubscriptionsParams({
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.status,
    this.customerId,
    this.outletId,
    this.servicePackageId,
    this.minPurchaseDate,
    this.maxPurchaseDate,
    this.expiryAtFrom,
    this.expiryAtTo,
    this.minPricePaid,
    this.maxPricePaid,
    this.sortBy = 'createdAt',
    this.sortDirection = 'desc',
  });

  @override
  List<Object?> get props => [
    page,
    perPage,
    search,
    status,
    customerId,
    outletId,
    servicePackageId,
    minPurchaseDate,
    maxPurchaseDate,
    expiryAtFrom,
    expiryAtTo,
    minPricePaid,
    maxPricePaid,
    sortBy,
    sortDirection,
  ];
}
