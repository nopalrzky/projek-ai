// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_context_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OrderContextModelImpl _$$OrderContextModelImplFromJson(
  Map<String, dynamic> json,
) => _$OrderContextModelImpl(
  customer: CustomerModel.fromJson(json['customer'] as Map<String, dynamic>),
  membership: json['membership'] == null
      ? null
      : MembershipContextModel.fromJson(
          json['membership'] as Map<String, dynamic>,
        ),
  quotas: (json['quotas'] as List<dynamic>)
      .map((e) => QuotaContextModel.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$$OrderContextModelImplToJson(
  _$OrderContextModelImpl instance,
) => <String, dynamic>{
  'customer': instance.customer,
  'membership': instance.membership,
  'quotas': instance.quotas,
};
