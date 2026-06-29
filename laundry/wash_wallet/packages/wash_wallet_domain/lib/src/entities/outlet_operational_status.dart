import 'package:equatable/equatable.dart';
import 'time_range.dart';
import 'weekly_hours.dart';

class OutletOperationalStatus extends Equatable {
  final bool isOpenNow;
  final String operationalStatus;
  final String operationalStatusLabel;
  final String operationalStatusMessage;
  final List<TimeRange> todayHours;
  final List<WeeklyHours> weeklyHours;
  final String? nextOpenAt;
  final String? nextCloseAt;
  final bool canCreateOrderNow;
  final String? orderDisabledReason;
  final String timezone;

  const OutletOperationalStatus({
    required this.isOpenNow,
    required this.operationalStatus,
    required this.operationalStatusLabel,
    required this.operationalStatusMessage,
    required this.todayHours,
    required this.weeklyHours,
    this.nextOpenAt,
    this.nextCloseAt,
    required this.canCreateOrderNow,
    this.orderDisabledReason,
    required this.timezone,
  });

  @override
  List<Object?> get props => [
        isOpenNow,
        operationalStatus,
        operationalStatusLabel,
        operationalStatusMessage,
        todayHours,
        weeklyHours,
        nextOpenAt,
        nextCloseAt,
        canCreateOrderNow,
        orderDisabledReason,
        timezone,
      ];
}
