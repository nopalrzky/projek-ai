import 'package:equatable/equatable.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class OrderItemState extends Equatable {
  const OrderItemState();

  @override
  List<Object?> get props => [];
}

class OrderItemInitial extends OrderItemState {
  const OrderItemInitial();
}

class OrderItemLoading extends OrderItemState {
  const OrderItemLoading();
}

class OrderItemsLoaded extends OrderItemState {
  final List<OrderItem> orderItems;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const OrderItemsLoaded({
    required this.orderItems,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  OrderItemsLoaded copyWith({
    List<OrderItem>? orderItems,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return OrderItemsLoaded(
      orderItems: orderItems ?? this.orderItems,
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
  List<Object?> get props => [orderItems, hasReachedMax, currentPage, lastPage, total, from, to, perPage, isPageLoading];
}

class OrderItemStarted extends OrderItemState {
  final OrderItem orderItem;

  const OrderItemStarted({required this.orderItem});

  @override
  List<Object?> get props => [orderItem];
}

class OrderItemCompleted extends OrderItemState {
  final OrderItem orderItem;

  const OrderItemCompleted({required this.orderItem});

  @override
  List<Object?> get props => [orderItem];
}

class OrderItemError extends OrderItemState {
  final String message;

  const OrderItemError(this.message);

  @override
  List<Object?> get props => [message];
}

class OrderItemDetailLoading extends OrderItemState {
  const OrderItemDetailLoading();
}

class OrderItemDetailLoaded extends OrderItemState {
  final OrderItem orderItem;

  const OrderItemDetailLoaded({required this.orderItem});

  @override
  List<Object?> get props => [orderItem];
}

class OrderItemDetailError extends OrderItemState {
  final String message;

  const OrderItemDetailError(this.message);

  @override
  List<Object?> get props => [message];
}
