import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/operational_day.dart';

part 'operational_day_model.freezed.dart';
part 'operational_day_model.g.dart';

@freezed
class OperationalDayModel with _$OperationalDayModel {
  const factory OperationalDayModel({
    required int id,
    int? outletId,
    required String dayOfWeek,
    String? openTime,
    String? closeTime,
    @Default(false) bool isClosed,
    @Default(false) bool isOpen,
    String? dayLabel,
  }) = _OperationalDayModel;

  factory OperationalDayModel.fromJson(Map<String, dynamic> json) =>
      _$OperationalDayModelFromJson(json);

  factory OperationalDayModel.fromEntity(OperationalDay entity) =>
      OperationalDayModel(
        id: entity.id,
        outletId: entity.outletId,
        dayOfWeek: entity.dayOfWeek,
        openTime: entity.openTime,
        closeTime: entity.closeTime,
        isClosed: entity.isClosed,
        isOpen: entity.isOpen,
        dayLabel: entity.dayLabel,
      );
}

extension OperationalDayModelX on OperationalDayModel {
  OperationalDay toEntity() => OperationalDay(
    id: id,
    outletId: outletId,
    dayOfWeek: dayOfWeek,
    openTime: openTime,
    closeTime: closeTime,
    isClosed: isClosed,
    isOpen: isOpen,
    dayLabel: dayLabel,
  );
}
