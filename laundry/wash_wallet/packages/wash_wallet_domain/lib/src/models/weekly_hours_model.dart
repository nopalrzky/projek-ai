import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/weekly_hours.dart';
import 'time_range_model.dart';

part 'weekly_hours_model.freezed.dart';
part 'weekly_hours_model.g.dart';

@freezed
class WeeklyHoursModel with _$WeeklyHoursModel {
  const factory WeeklyHoursModel({
    required String day,
    required String dayLabel,
    required bool isClosed,
    @Default([]) List<TimeRangeModel> timeRanges,
  }) = _WeeklyHoursModel;

  const WeeklyHoursModel._();

  factory WeeklyHoursModel.fromJson(Map<String, dynamic> json) =>
      _$WeeklyHoursModelFromJson(json);

  WeeklyHours toEntity() {
    return WeeklyHours(
      day: day,
      dayLabel: dayLabel,
      isClosed: isClosed,
      timeRanges: timeRanges.map((e) => e.toEntity()).toList(),
    );
  }
}
