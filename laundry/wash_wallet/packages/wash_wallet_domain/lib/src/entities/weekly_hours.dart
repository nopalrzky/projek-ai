import 'package:equatable/equatable.dart';
import 'time_range.dart';

class WeeklyHours extends Equatable {
  final String day;
  final String dayLabel;
  final bool isClosed;
  final List<TimeRange> timeRanges;

  const WeeklyHours({
    required this.day,
    required this.dayLabel,
    required this.isClosed,
    required this.timeRanges,
  });

  @override
  List<Object?> get props => [day, dayLabel, isClosed, timeRanges];
}
