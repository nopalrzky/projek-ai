import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class DepositState extends Equatable {
  const DepositState();

  @override
  List<Object?> get props => [];
}

class DepositInitial extends DepositState {
  const DepositInitial();
}

class DepositLoading extends DepositState {
  const DepositLoading();
}

class DepositsLoaded extends DepositState {
  final List<Deposit> deposits;
  final bool hasReachedMax;
  final int currentPage;

  const DepositsLoaded({
    required this.deposits,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  DepositsLoaded copyWith({
    List<Deposit>? deposits,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return DepositsLoaded(
      deposits: deposits ?? this.deposits,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [deposits, hasReachedMax, currentPage];
}

class DepositDetailLoaded extends DepositState {
  final Deposit deposit;

  const DepositDetailLoaded(this.deposit);

  @override
  List<Object?> get props => [deposit];
}

class DepositActionSuccess extends DepositState {
  final String message;
  final Deposit? deposit;

  const DepositActionSuccess(this.message, {this.deposit});

  @override
  List<Object?> get props => [message, deposit];
}

class DepositFailure extends DepositState {
  final Failure failure;

  const DepositFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
