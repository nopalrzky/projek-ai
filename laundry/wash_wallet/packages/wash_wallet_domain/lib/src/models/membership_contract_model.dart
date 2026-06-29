import 'package:freezed_annotation/freezed_annotation.dart';
import 'customer_model.dart';
import 'membership_plan_model.dart';
import 'outlet_model.dart';
import '../entities/membership_contract.dart';
import '../helpers/json_converters.dart';

part 'membership_contract_model.freezed.dart';
part 'membership_contract_model.g.dart';

@freezed
class MembershipContractModel with _$MembershipContractModel {
  const factory MembershipContractModel({
    required int id,
    required int customerId,
    required int outletId,
    required int membershipPlanId,
    String? startAt,
    String? expiredAt,
    required String status,
    int? replacedById,
    int? upgradeFromId,
    required double totalPaid,
    String? formattedTotalPaid,
    String? createdAt,
    String? updatedAt,
    CustomerModel? customer,
    OutletModel? outlet,
    MembershipPlanModel? membershipPlan,
  }) = _MembershipContractModel;

  const MembershipContractModel._();

  factory MembershipContractModel.fromJson(Map<String, dynamic> json) =>
      _$MembershipContractModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['customerId'] = toInt(json['customerId'] ?? json['customer_id']);
    normalized['outletId'] = toInt(json['outletId'] ?? json['outlet_id']);
    normalized['membershipPlanId'] = toInt(
      json['membershipPlanId'] ?? json['membership_plan_id'],
    );
    normalized['totalPaid'] = toDouble(json['totalPaid'] ?? json['total_paid']);
    normalized['startAt'] = json['startAt'] ?? json['start_at'];
    normalized['expiredAt'] = json['expiredAt'] ?? json['expired_at'];
    normalized['replacedById'] = toIntOrNull(
      json['replacedById'] ?? json['replaced_by_id'],
    );
    normalized['upgradeFromId'] = toIntOrNull(
      json['upgradeFromId'] ?? json['upgrade_from_id'],
    );
    normalized['status'] = json['status'] ?? 'active';

    return normalized;
  }
}

extension MembershipContractModelX on MembershipContractModel {
  MembershipContract toEntity() => MembershipContract(
    id: id,
    customerId: customerId,
    outletId: outletId,
    membershipPlanId: membershipPlanId,
    startAt: startAt,
    expiredAt: expiredAt,
    status: status,
    replacedById: replacedById,
    upgradeFromId: upgradeFromId,
    totalPaid: totalPaid,
    formattedTotalPaid: formattedTotalPaid,
    createdAt: createdAt,
    updatedAt: updatedAt,
    customer: customer?.toEntity(),
    outlet: outlet?.toEntity(),
    membershipPlan: membershipPlan?.toEntity(),
  );
}
