import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class AccountState extends Equatable {
  const AccountState();

  @override
  List<Object?> get props => [];
}

class AccountInitial extends AccountState {
  const AccountInitial();
}

class AccountLoading extends AccountState {
  const AccountLoading();
}

class AccountsLoaded extends AccountState {
  final List<Account> accounts;
  final bool hasReachedMax;
  final int currentPage;

  const AccountsLoaded(
    this.accounts, {
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  @override
  List<Object?> get props => [accounts, hasReachedMax, currentPage];
}

class AccountFailure extends AccountState {
  final Failure failure;

  const AccountFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
