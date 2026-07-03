import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class MembershipPlanState extends Equatable {
  const MembershipPlanState();

  @override
  List<Object?> get props => [];
}

class MembershipPlanInitial extends MembershipPlanState {
  const MembershipPlanInitial();
}

class MembershipPlanLoading extends MembershipPlanState {
  const MembershipPlanLoading();
}

class MembershipPlansLoaded extends MembershipPlanState {
  final List<MembershipPlan> plans;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const MembershipPlansLoaded(
    this.plans, {
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  MembershipPlansLoaded copyWith({
    List<MembershipPlan>? plans,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return MembershipPlansLoaded(
      plans ?? this.plans,
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
        plans,
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

class MembershipPlanLoaded extends MembershipPlanState {
  final MembershipPlan plan;

  const MembershipPlanLoaded(this.plan);

  @override
  List<Object?> get props => [plan];
}

class MembershipPlanFailure extends MembershipPlanState {
  final Failure failure;

  const MembershipPlanFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
