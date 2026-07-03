import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/outlet_operational_status.dart';
import 'time_range_model.dart';
import 'weekly_hours_model.dart';

part 'outlet_operational_status_model.freezed.dart';
part 'outlet_operational_status_model.g.dart';

@freezed
class OutletOperationalStatusModel with _$OutletOperationalStatusModel {
  const factory OutletOperationalStatusModel({
    @Default(false) bool isOpenNow,
    @Default('hours_not_set') String operationalStatus,
    @Default('Jam operasional belum tersedia') String operationalStatusLabel,
    @Default('Outlet belum dapat menerima order saat ini.')
    String operationalStatusMessage,
    @Default([]) List<TimeRangeModel> todayHours,
    @Default([]) List<WeeklyHoursModel> weeklyHours,
    String? nextOpenAt,
    String? nextCloseAt,
    @Default(false) bool canCreateOrderNow,
    String? orderDisabledReason,
    @Default('Asia/Jakarta') String timezone,
  }) = _OutletOperationalStatusModel;

  const OutletOperationalStatusModel._();

  factory OutletOperationalStatusModel.fromJson(Map<String, dynamic> json) =>
      _$OutletOperationalStatusModelFromJson(json);

  factory OutletOperationalStatusModel.fromEntity(
    OutletOperationalStatus entity,
  ) {
    return OutletOperationalStatusModel(
      isOpenNow: entity.isOpenNow,
      operationalStatus: entity.operationalStatus,
      operationalStatusLabel: entity.operationalStatusLabel,
      operationalStatusMessage: entity.operationalStatusMessage,
      todayHours: entity.todayHours
          .map((e) => TimeRangeModel(open: e.open, close: e.close))
          .toList(),
      weeklyHours: entity.weeklyHours
          .map(
            (e) => WeeklyHoursModel(
              day: e.day,
              dayLabel: e.dayLabel,
              isClosed: e.isClosed,
              timeRanges: e.timeRanges
                  .map(
                    (range) =>
                        TimeRangeModel(open: range.open, close: range.close),
                  )
                  .toList(),
            ),
          )
          .toList(),
      nextOpenAt: entity.nextOpenAt,
      nextCloseAt: entity.nextCloseAt,
      canCreateOrderNow: entity.canCreateOrderNow,
      orderDisabledReason: entity.orderDisabledReason,
      timezone: entity.timezone,
    );
  }

  OutletOperationalStatus toEntity() {
    return OutletOperationalStatus(
      isOpenNow: isOpenNow,
      operationalStatus: operationalStatus,
      operationalStatusLabel: operationalStatusLabel,
      operationalStatusMessage: operationalStatusMessage,
      todayHours: todayHours.map((e) => e.toEntity()).toList(),
      weeklyHours: weeklyHours.map((e) => e.toEntity()).toList(),
      nextOpenAt: nextOpenAt,
      nextCloseAt: nextCloseAt,
      canCreateOrderNow: canCreateOrderNow,
      orderDisabledReason: orderDisabledReason,
      timezone: timezone,
    );
  }
}
