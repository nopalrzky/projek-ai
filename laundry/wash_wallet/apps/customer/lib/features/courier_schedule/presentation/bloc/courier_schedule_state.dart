import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/courier_schedule.dart';

abstract class CourierScheduleState extends Equatable {
  const CourierScheduleState();

  @override
  List<Object?> get props => [];
}

class CourierScheduleInitial extends CourierScheduleState {
  const CourierScheduleInitial();
}

class CourierScheduleLoading extends CourierScheduleState {
  const CourierScheduleLoading();
}

class CourierScheduleLoaded extends CourierScheduleState {
  final CourierScheduleData data;

  const CourierScheduleLoaded(this.data);

  @override
  List<Object?> get props => [data];
}

class CourierScheduleFailure extends CourierScheduleState {
  final Failure failure;

  const CourierScheduleFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
