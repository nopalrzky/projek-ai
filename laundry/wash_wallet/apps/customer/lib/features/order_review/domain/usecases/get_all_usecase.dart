import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_review_repository.dart';

class GetAllOrderReviewParams extends Equatable {
  final int? outletId;
  final int? customerAccountId;
  final int? orderId;
  final int? rating;
  final int page;
  final int perPage;
  final String sortBy;
  final String sortDirection;

  const GetAllOrderReviewParams({
    this.outletId,
    this.customerAccountId,
    this.orderId,
    this.rating,
    this.page = 1,
    this.perPage = 15,
    this.sortBy = 'created_at',
    this.sortDirection = 'desc',
  });

  @override
  List<Object?> get props => [
    outletId,
    customerAccountId,
    orderId,
    rating,
    page,
    perPage,
    sortBy,
    sortDirection,
  ];
}

class GetAllOrderReviewUseCase {
  final OrderReviewRepository _repository;

  GetAllOrderReviewUseCase(this._repository);

  Future<Result<List<OrderReview>>> call(GetAllOrderReviewParams params) {
    return _repository.getAll(
      outletId: params.outletId,
      customerAccountId: params.customerAccountId,
      orderId: params.orderId,
      rating: params.rating,
      page: params.page,
      perPage: params.perPage,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    );
  }
}
