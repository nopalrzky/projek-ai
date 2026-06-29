import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class GetAllOrderParams extends Equatable {
  final int customerAccountId;
  final int page;
  final int perPage;
  final String? search;
  final String? status;
  final String? sortBy;
  final String? sortDirection;

  const GetAllOrderParams({
    required this.customerAccountId,
    this.page = 1,
    this.perPage = 15,
    this.search,
    this.status,
    this.sortBy,
    this.sortDirection,
  });

  @override
  List<Object?> get props => [
    customerAccountId,
    page,
    perPage,
    search,
    status,
    sortBy,
    sortDirection,
  ];
}

class GetAllUsecase {
  final OrderRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Order>>> call(GetAllOrderParams params) {
    return _repository.getAll(
      customerAccountId: params.customerAccountId,
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      status: params.status,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}
