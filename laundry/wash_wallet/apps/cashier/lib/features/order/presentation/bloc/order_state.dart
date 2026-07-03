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
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const OrdersLoaded({
    required this.orders,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  OrdersLoaded copyWith({
    List<Order>? orders,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return OrdersLoaded(
      orders: orders ?? this.orders,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      lastPage: lastPage ?? this.lastPage,
      total: total ?? this.total,
      from: from ?? this.from,
      to: to ?? this.to,
      perPage: perPage ?? this.perPage,
      isPageLoading: isPageLoading ?? this.isPageLoading,
    );
  }

  @override
  List<Object?> get props => [
        orders,
        hasReachedMax,
        currentPage,
        lastPage,
        total,
        from,
        to,
        perPage,
        isPageLoading,
      ];
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
