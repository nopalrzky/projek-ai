// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'outlet_access_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OutletAccessModelImpl _$$OutletAccessModelImplFromJson(
  Map<String, dynamic> json,
) => _$OutletAccessModelImpl(
  outletId: (json['outletId'] as num).toInt(),
  outletName: json['outletName'] as String,
  positions: (json['positions'] as List<dynamic>)
      .map((e) => PositionAccessModel.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$$OutletAccessModelImplToJson(
  _$OutletAccessModelImpl instance,
) => <String, dynamic>{
  'outletId': instance.outletId,
  'outletName': instance.outletName,
  'positions': instance.positions,
};
