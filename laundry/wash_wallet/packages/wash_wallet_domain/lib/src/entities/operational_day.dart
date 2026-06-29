import 'package:equatable/equatable.dart';

class OperationalDay extends Equatable {
  final int id;
  final int? outletId;
  final String dayOfWeek;
  final String? openTime;
  final String? closeTime;
  final bool isClosed;
  final bool isOpen;
  final String? dayLabel;

  const OperationalDay({
    required this.id,
    this.outletId,
    required this.dayOfWeek,
    this.openTime,
    this.closeTime,
    this.isClosed = false,
    this.isOpen = false,
    this.dayLabel,
  });

  @override
  List<Object?> get props => [
    id,
    outletId,
    dayOfWeek,
    openTime,
    closeTime,
    isClosed,
    isOpen,
    dayLabel,
  ];
}
