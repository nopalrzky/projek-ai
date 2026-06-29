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

  const MembershipPlansLoaded(
    this.plans, {
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  @override
  List<Object?> get props => [plans, hasReachedMax, currentPage];
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
