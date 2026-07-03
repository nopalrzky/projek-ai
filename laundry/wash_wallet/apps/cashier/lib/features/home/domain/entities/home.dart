import 'package:equatable/equatable.dart';

class Home extends Equatable {
  final String employeeName;
  final String employeePhone;
  final double cashBalance;
  final int ordersInProduction;
  final int ordersNotPickedUp;
  final int ordersPickedUp;

  const Home({
    required this.employeeName,
    required this.employeePhone,
    required this.cashBalance,
    required this.ordersInProduction,
    required this.ordersNotPickedUp,
    required this.ordersPickedUp,
  });

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
