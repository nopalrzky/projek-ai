import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class OrderState extends Equatable {
  const OrderState();

  @override
  List<Object?> get props => [];
}

class OrderInitial extends OrderState {
  const OrderInitial();
}

class OrderLoading extends OrderState {
  const OrderLoading();
}

class OrdersLoaded extends OrderState {
  final List<Order> orders;
  final bool hasReachedMax;
  final int currentPage;

  const OrdersLoaded({
    required this.orders,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  OrdersLoaded copyWith({
    List<Order>? orders,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return OrdersLoaded(
      orders: orders ?? this.orders,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [orders, hasReachedMax, currentPage];
}

class OrderError extends OrderState {
  final String message;

  const OrderError(this.message);

  @override
  List<Object?> get props => [message];
}

class OrderDetailLoaded extends OrderState {
  final Order order;

  const OrderDetailLoaded({required this.order});

  @override
  List<Object?> get props => [order];
}

class OrderDetailError extends OrderState {
  final String message;

  const OrderDetailError(this.message);

  @override
  List<Object?> get props => [message];
}

class OrderDraftLoaded extends OrderState {
  final OrderDraft? draft;

  const OrderDraftLoaded({this.draft});

  @override
  List<Object?> get props => [draft];
}

class OrderWeighingDraftLoaded extends OrderState {
  final WeighingDraft? draft;

  const OrderWeighingDraftLoaded({this.draft});

  @override
  List<Object?> get props => [draft];
}

class OrderActionSuccess extends OrderState {
  final String message;
  final Order? order;

  const OrderActionSuccess(this.message, {this.order});

  @override
  List<Object?> get props => [message, order];
}

class OrderFailure extends OrderState {
  final Failure failure;

  const OrderFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
