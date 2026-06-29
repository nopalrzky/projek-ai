// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'membership_contract_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MembershipContractModelImpl _$$MembershipContractModelImplFromJson(
  Map<String, dynamic> json,
) => _$MembershipContractModelImpl(
  id: (json['id'] as num).toInt(),
  customerId: (json['customerId'] as num).toInt(),
  outletId: (json['outletId'] as num).toInt(),
  membershipPlanId: (json['membershipPlanId'] as num).toInt(),
  startAt: json['startAt'] as String?,
  expiredAt: json['expiredAt'] as String?,
  status: json['status'] as String,
  replacedById: (json['replacedById'] as num?)?.toInt(),
  upgradeFromId: (json['upgradeFromId'] as num?)?.toInt(),
  totalPaid: (json['totalPaid'] as num).toDouble(),
  formattedTotalPaid: json['formattedTotalPaid'] as String?,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
  customer: json['customer'] == null
      ? null
      : CustomerModel.fromJson(json['customer'] as Map<String, dynamic>),
  outlet: json['outlet'] == null
      ? null
      : OutletModel.fromJson(json['outlet'] as Map<String, dynamic>),
  membershipPlan: json['membershipPlan'] == null
      ? null
      : MembershipPlanModel.fromJson(
          json['membershipPlan'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$$MembershipContractModelImplToJson(
  _$MembershipContractModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'customerId': instance.customerId,
  'outletId': instance.outletId,
  'membershipPlanId': instance.membershipPlanId,
  'startAt': instance.startAt,
  'expiredAt': instance.expiredAt,
  'status': instance.status,
  'replacedById': instance.replacedById,
  'upgradeFromId': instance.upgradeFromId,
  'totalPaid': instance.totalPaid,
  'formattedTotalPaid': instance.formattedTotalPaid,
  'createdAt': instance.createdAt,
  'updatedAt': instance.updatedAt,
  'customer': instance.customer,
  'outlet': instance.outlet,
  'membershipPlan': instance.membershipPlan,
};
