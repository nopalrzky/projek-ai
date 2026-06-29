import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/unit.dart';

part 'unit_model.freezed.dart';
part 'unit_model.g.dart';

@freezed
class UnitModel with _$UnitModel {
  const factory UnitModel({
    required int id,
    String? name,
    String? symbol,
    String? description,
    @Default(false) bool isActive,
    @Default(0) int laundryServicesCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
  }) = _UnitModel;

  factory UnitModel.fromJson(Map<String, dynamic> json) =>
      _$UnitModelFromJson(json);
}

extension UnitModelX on UnitModel {
  Unit toEntity() => Unit(
    id: id,
    name: name,
    symbol: symbol,
    description: description,
    isActive: isActive,
    laundryServicesCount: laundryServicesCount,
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
  );
}
