// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'membership_context_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MembershipContextModelImpl _$$MembershipContextModelImplFromJson(
  Map<String, dynamic> json,
) => _$MembershipContextModelImpl(
  membershipContractId: (json['membershipContractId'] as num).toInt(),
  membershipPlanName: json['membershipPlanName'] as String,
  discountPercentage: (json['discountPercentage'] as num).toDouble(),
  expiredAt: json['expiredAt'] as String?,
);

Map<String, dynamic> _$$MembershipContextModelImplToJson(
  _$MembershipContextModelImpl instance,
) => <String, dynamic>{
  'membershipContractId': instance.membershipContractId,
  'membershipPlanName': instance.membershipPlanName,
  'discountPercentage': instance.discountPercentage,
  'expiredAt': instance.expiredAt,
};
