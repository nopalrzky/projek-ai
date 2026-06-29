import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class MembershipContractState extends Equatable {
  const MembershipContractState();

  @override
  List<Object?> get props => [];
}

class MembershipContractInitial extends MembershipContractState {
  const MembershipContractInitial();
}

class MembershipContractLoading extends MembershipContractState {
  const MembershipContractLoading();
}

class MembershipContractsLoaded extends MembershipContractState {
  final List<MembershipContract> contracts;
  final bool hasReachedMax;
  final int currentPage;

  const MembershipContractsLoaded({
    required this.contracts,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  @override
  List<Object?> get props => [contracts, hasReachedMax, currentPage];
}

class MembershipContractDetailLoaded extends MembershipContractState {
  final MembershipContract contract;

  const MembershipContractDetailLoaded(this.contract);

  @override
  List<Object?> get props => [contract];
}

class MembershipContractFailure extends MembershipContractState {
  final Failure failure;

  const MembershipContractFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
