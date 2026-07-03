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
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const DepositsLoaded({
    required this.deposits,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  DepositsLoaded copyWith({
    List<Deposit>? deposits,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return DepositsLoaded(
      deposits: deposits ?? this.deposits,
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
        deposits,
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
