import 'package:equatable/equatable.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class Home extends Equatable {
  final String employeeName;
  final String outletName;
  final HomeSummary summary;
  final List<ProcessQueue> processQueue;
  final List<ActiveOrder> activeOrders;
  final List<PriorityOrder> priorityOrders;

  const Home({
    required this.employeeName,
    required this.outletName,
    required this.summary,
    required this.processQueue,
    required this.activeOrders,
    required this.priorityOrders,
  });

  @override
  List<Object?> get props => [
    employeeName,
    outletName,
    summary,
    processQueue,
    activeOrders,
    priorityOrders,
  ];
}
