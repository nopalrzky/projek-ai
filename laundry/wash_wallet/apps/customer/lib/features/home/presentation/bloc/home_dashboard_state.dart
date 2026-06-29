import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../domain/entities/home_dashboard.dart';

sealed class HomeDashboardState extends Equatable {
  const HomeDashboardState();

  @override
  List<Object?> get props => [];
}

class HomeDashboardInitial extends HomeDashboardState {
  const HomeDashboardInitial();
}

class HomeDashboardLoading extends HomeDashboardState {
  const HomeDashboardLoading();
}

class HomeDashboardSuccess extends HomeDashboardState {
  final HomeDashboard dashboard;

  const HomeDashboardSuccess(this.dashboard);

  @override
  List<Object?> get props => [dashboard];
}

class HomeDashboardFailure extends HomeDashboardState {
  final Failure failure;

  const HomeDashboardFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
