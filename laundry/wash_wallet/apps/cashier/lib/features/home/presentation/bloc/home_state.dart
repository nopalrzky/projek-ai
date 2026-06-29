import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

sealed class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {
  const HomeInitial();
}

class HomeLoading extends HomeState {
  const HomeLoading();
}

class HomeLoaded extends HomeState {
  final String employeeName;
  final String employeePhone;
  final double cashBalance;
  final int ordersInProduction;
  final int ordersNotPickedUp;
  final int ordersPickedUp;

  const HomeLoaded({
    required this.employeeName,
    required this.employeePhone,
    required this.cashBalance,
    required this.ordersInProduction,
    required this.ordersNotPickedUp,
    required this.ordersPickedUp,
  });

  HomeLoaded copyWith({
    String? employeeName,
    String? employeePhone,
    double? cashBalance,
    int? ordersInProduction,
    int? ordersNotPickedUp,
    int? ordersPickedUp,
  }) {
    return HomeLoaded(
      employeeName: employeeName ?? this.employeeName,
      employeePhone: employeePhone ?? this.employeePhone,
      cashBalance: cashBalance ?? this.cashBalance,
      ordersInProduction: ordersInProduction ?? this.ordersInProduction,
      ordersNotPickedUp: ordersNotPickedUp ?? this.ordersNotPickedUp,
      ordersPickedUp: ordersPickedUp ?? this.ordersPickedUp,
    );
  }

  @override
  List<Object?> get props => [
    employeeName,
    employeePhone,
    cashBalance,
    ordersInProduction,
    ordersNotPickedUp,
    ordersPickedUp,
  ];
}

class HomeError extends HomeState {
  final Failure failure;

  const HomeError(this.failure);

  @override
  List<Object?> get props => [failure];
}
