import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/membership_context.dart';
import '../helpers/json_converters.dart';

part 'membership_context_model.freezed.dart';
part 'membership_context_model.g.dart';

@freezed
class MembershipContextModel with _$MembershipContextModel {
  const factory MembershipContextModel({
    required int membershipContractId,
    required String membershipPlanName,
    required double discountPercentage,
    String? expiredAt,
  }) = _MembershipContextModel;

  const MembershipContextModel._();

  factory MembershipContextModel.fromJson(Map<String, dynamic> json) =>
      _$MembershipContextModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['membershipContractId'] = toInt(
      json['membershipContractId'] ?? json['membership_contract_id'],
    );
    normalized['membershipPlanName'] =
        json['membershipPlanName'] ?? json['membership_plan_name'];
    normalized['discountPercentage'] = toDouble(
      json['discountPercentage'] ?? json['discount_percentage'],
    );

    return normalized;
  }

  MembershipContext toEntity() => MembershipContext(
    membershipContractId: membershipContractId,
    membershipPlanName: membershipPlanName,
    discountPercentage: discountPercentage,
    expiredAt: expiredAt,
  );
}
