import '../../domain/entities/courier_schedule.dart';

class CourierScheduleModel extends CourierSchedule {
  const CourierScheduleModel({
    required super.id,
    required super.outletId,
    required super.dayOfWeek,
    required super.dayLabel,
    required super.type,
    required super.typeLabel,
    required super.startTime,
    required super.endTime,
    required super.isActive,
    super.isBookable,
    super.availabilityStatus,
    super.availabilityLabel,
    super.unavailableReason,
    super.createdAt,
    super.updatedAt,
  });

  factory CourierScheduleModel.fromJson(Map<String, dynamic> json) {
    return CourierScheduleModel(
      id: _readInt(json['id']),
      outletId: _readInt(json['outletId']),
      dayOfWeek: json['dayOfWeek'] as String,
      dayLabel: json['dayLabel'] as String,
      type: json['type'] as String,
      typeLabel: json['typeLabel'] as String,
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      isActive: json['isActive'] == true || json['isActive'] == 1,
      isBookable: json['isBookable'] as bool?,
      availabilityStatus: json['availabilityStatus'] as String?,
      availabilityLabel: json['availabilityLabel'] as String?,
      unavailableReason: json['unavailableReason'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  static int _readInt(Object? value) {
    if (value is int) return value;
    if (value is String) return int.parse(value);
    throw FormatException('Expected int value but got ${value.runtimeType}');
  }
}

class CourierScheduleDataModel extends CourierScheduleData {
  const CourierScheduleDataModel({
    required super.schedules,
    super.defaultDate,
    super.defaultDayLabel,
    super.reason,
  });

  factory CourierScheduleDataModel.fromJsonResponse(Map<String, dynamic> body) {
    final meta = body['meta'] as Map<String, dynamic>? ?? {};
    final data = body['data'] as List? ?? [];

    return CourierScheduleDataModel(
      schedules: data
          .map(
            (e) => CourierScheduleModel.fromJson(Map<String, dynamic>.from(e)),
          )
          .toList(),
      defaultDate: meta['defaultDate'] as String?,
      defaultDayLabel: meta['defaultDayLabel'] as String?,
      reason: meta['reason'] as String?,
    );
  }

  factory CourierScheduleDataModel.fromList(List<dynamic> list) {
    return CourierScheduleDataModel(
      schedules: list
          .map(
            (e) => CourierScheduleModel.fromJson(Map<String, dynamic>.from(e)),
          )
          .toList(),
    );
  }

  CourierScheduleData toEntity() {
    return CourierScheduleData(
      schedules: schedules,
      defaultDate: defaultDate,
      defaultDayLabel: defaultDayLabel,
      reason: reason,
    );
  }
}
