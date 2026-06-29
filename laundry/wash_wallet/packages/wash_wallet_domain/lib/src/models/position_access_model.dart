import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/position_access.dart';

part 'position_access_model.freezed.dart';
part 'position_access_model.g.dart';

@freezed
class PositionAccessModel with _$PositionAccessModel {
  const factory PositionAccessModel({
    required int positionId,
    required String positionName,
    required String slug,
    required List<String> permissions,
  }) = _PositionAccessModel;

  const PositionAccessModel._();

  factory PositionAccessModel.fromJson(Map<String, dynamic> json) =>
      _$PositionAccessModelFromJson(json);

  PositionAccess toEntity() => PositionAccess(
    positionId: positionId,
    positionName: positionName,
    slug: slug,
    permissions: permissions,
  );

  factory PositionAccessModel.fromEntity(PositionAccess entity) => PositionAccessModel(
    positionId: entity.positionId,
    positionName: entity.positionName,
    slug: entity.slug,
    permissions: entity.permissions,
  );
}
