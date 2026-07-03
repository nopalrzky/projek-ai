import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/outlet_access.dart';
import 'position_access_model.dart';

part 'outlet_access_model.freezed.dart';
part 'outlet_access_model.g.dart';

@freezed
class OutletAccessModel with _$OutletAccessModel {
  const factory OutletAccessModel({
    required int outletId,
    required String outletName,
    required List<PositionAccessModel> positions,
  }) = _OutletAccessModel;

  const OutletAccessModel._();

  factory OutletAccessModel.fromJson(Map<String, dynamic> json) =>
      _$OutletAccessModelFromJson(json);

  OutletAccess toEntity() => OutletAccess(
    outletId: outletId,
    outletName: outletName,
    positions: positions.map((p) => p.toEntity()).toList(),
  );

  factory OutletAccessModel.fromEntity(OutletAccess entity) =>
      OutletAccessModel(
        outletId: entity.outletId,
        outletName: entity.outletName,
        positions: entity.positions
            .map((p) => PositionAccessModel.fromEntity(p))
            .toList(),
      );
}
