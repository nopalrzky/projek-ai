import 'package:equatable/equatable.dart';

class ProcessQueue extends Equatable {
  final int processId;
  final String processName;
  final int totalOrders;

  const ProcessQueue({
    required this.processId,
    required this.processName,
    required this.totalOrders,
  });

  @override
  List<Object?> get props => [processId, processName, totalOrders];
}
