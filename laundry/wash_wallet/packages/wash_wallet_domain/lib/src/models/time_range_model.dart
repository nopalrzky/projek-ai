import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/time_range.dart';

part 'time_range_model.freezed.dart';
part 'time_range_model.g.dart';

@freezed
class TimeRangeModel with _$TimeRangeModel {
  const factory TimeRangeModel({
    required String open,
    required String close,
  }) = _TimeRangeModel;

  const TimeRangeModel._();

  factory TimeRangeModel.fromJson(Map<String, dynamic> json) =>
      _$TimeRangeModelFromJson(json);

  TimeRange toEntity() {
    return TimeRange(
      open: open,
      close: close,
    );
  }
}
