import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/membership_plan.dart';
import '../helpers/json_converters.dart';

part 'membership_plan_model.freezed.dart';
part 'membership_plan_model.g.dart';

@freezed
class MembershipPlanModel with _$MembershipPlanModel {
  const factory MembershipPlanModel({
    required int id,
    required int outletId,
    required String name,
    required double price,
    required int durationDays,
    required bool isActive,
    required double discountPercentage,
    String? description,
    int? level,
    String? createdAt,
    String? updatedAt,
    @Default(0) int membershipContractsCount,
  }) = _MembershipPlanModel;

  const MembershipPlanModel._();

  factory MembershipPlanModel.fromJson(Map<String, dynamic> json) =>
      _$MembershipPlanModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['outletId'] = toInt(json['outletId'] ?? json['outlet_id']);
    normalized['price'] = toDouble(json['price']);
    normalized['durationDays'] = toInt(
      json['durationDays'] ?? json['duration_days'],
    );
    normalized['isActive'] = toBool(json['isActive'] ?? json['is_active']);
    normalized['discountPercentage'] = toDouble(
      json['discountPercentage'] ?? json['discount_percentage'],
    );
    normalized['level'] = toIntOrNull(json['level']);
    normalized['membershipContractsCount'] = toInt(
      json['membershipContractsCount'] ?? json['membership_contracts_count'],
    );

    return normalized;
  }
}

extension MembershipPlanModelX on MembershipPlanModel {
  MembershipPlan toEntity() => MembershipPlan(
    id: id,
    outletId: outletId,
    name: name,
    price: price,
    durationDays: durationDays,
    isActive: isActive,
    discountPercentage: discountPercentage,
    description: description,
    level: level,
    createdAt: createdAt,
    updatedAt: updatedAt,
    membershipContractsCount: membershipContractsCount,
  );
}
