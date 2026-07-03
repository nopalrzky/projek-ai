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
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const MembershipContractsLoaded({
    required this.contracts,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  MembershipContractsLoaded copyWith({
    List<MembershipContract>? contracts,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return MembershipContractsLoaded(
      contracts: contracts ?? this.contracts,
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
        contracts,
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
