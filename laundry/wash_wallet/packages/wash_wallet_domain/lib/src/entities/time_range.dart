import 'package:equatable/equatable.dart';

class TimeRange extends Equatable {
  final String open;
  final String close;

  const TimeRange({required this.open, required this.close});

  @override
  List<Object?> get props => [open, close];
}
