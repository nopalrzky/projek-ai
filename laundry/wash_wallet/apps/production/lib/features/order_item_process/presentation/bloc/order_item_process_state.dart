import 'package:equatable/equatable.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class OrderItemProcessState extends Equatable {
  const OrderItemProcessState();

  @override
  List<Object?> get props => [];
}

class OrderItemProcessInitial extends OrderItemProcessState {
  const OrderItemProcessInitial();
}

class OrderItemProcessLoading extends OrderItemProcessState {
  const OrderItemProcessLoading();
}

class OrderItemProcessStarted extends OrderItemProcessState {
  final OrderItemProcess process;

  const OrderItemProcessStarted(this.process);

  @override
  List<Object?> get props => [process];
}

class OrderItemProcessCompleted extends OrderItemProcessState {
  final OrderItemProcess process;

  const OrderItemProcessCompleted(this.process);

  @override
  List<Object?> get props => [process];
}

class OrderItemProcessError extends OrderItemProcessState {
  final String message;

  const OrderItemProcessError(this.message);

  @override
  List<Object?> get props => [message];
}
