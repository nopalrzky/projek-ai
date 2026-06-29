import 'package:equatable/equatable.dart';

class HomeSummary extends Equatable {
  final int ordersToday;
  final int ordersInProgress;
  final int ordersReadyForPickup;
  final int ordersCompleted;

  const HomeSummary({
    required this.ordersToday,
    required this.ordersInProgress,
    required this.ordersReadyForPickup,
    required this.ordersCompleted,
  });

  @override
  List<Object?> get props => [
    ordersToday,
    ordersInProgress,
    ordersReadyForPickup,
    ordersCompleted,
  ];
}
