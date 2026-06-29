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

  const OrderItemsLoaded({
    required this.orderItems,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  OrderItemsLoaded copyWith({
    List<OrderItem>? orderItems,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return OrderItemsLoaded(
      orderItems: orderItems ?? this.orderItems,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [orderItems, hasReachedMax, currentPage];
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
