// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_order_item_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PrintOrderItemModelImpl _$$PrintOrderItemModelImplFromJson(
  Map<String, dynamic> json,
) => _$PrintOrderItemModelImpl(
  laundryServiceName: json['laundryServiceName'] as String,
  quantity: (json['quantity'] as num).toDouble(),
  unitName: json['unitName'] as String,
  unitPrice: (json['unitPrice'] as num).toDouble(),
  totalAmount: (json['totalAmount'] as num).toDouble(),
);

Map<String, dynamic> _$$PrintOrderItemModelImplToJson(
  _$PrintOrderItemModelImpl instance,
) => <String, dynamic>{
  'laundryServiceName': instance.laundryServiceName,
  'quantity': instance.quantity,
  'unitName': instance.unitName,
  'unitPrice': instance.unitPrice,
  'totalAmount': instance.totalAmount,
};
