import 'package:equatable/equatable.dart';

class CourierSchedule extends Equatable {
  final int id;
  final int outletId;
  final String dayOfWeek;
  final String dayLabel;
  final String type; 
  final String typeLabel;
  final String startTime;
  final String endTime;
  final bool isActive;
  final bool? isBookable;
  final String? availabilityStatus;
  final String? availabilityLabel;
  final String? unavailableReason;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CourierSchedule({
    required this.id,
    required this.outletId,
    required this.dayOfWeek,
    required this.dayLabel,
    required this.type,
    required this.typeLabel,
    required this.startTime,
    required this.endTime,
    required this.isActive,
    this.isBookable,
    this.availabilityStatus,
    this.availabilityLabel,
    this.unavailableReason,
    this.createdAt,
    this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        outletId,
        dayOfWeek,
        dayLabel,
        type,
        typeLabel,
        startTime,
        endTime,
        isActive,
        isBookable,
        availabilityStatus,
        availabilityLabel,
        unavailableReason,
        createdAt,
        updatedAt,
      ];
}

class CourierScheduleData extends Equatable {
  final List<CourierSchedule> schedules;
  final String? defaultDate;
  final String? defaultDayLabel;
  final String? reason;

  const CourierScheduleData({
    required this.schedules,
    this.defaultDate,
    this.defaultDayLabel,
    this.reason,
  });

  @override
  List<Object?> get props => [schedules, defaultDate, defaultDayLabel, reason];
}
