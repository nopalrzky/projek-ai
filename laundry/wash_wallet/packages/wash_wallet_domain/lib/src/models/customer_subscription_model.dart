import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/customer_subscription.dart';
import '../helpers/json_converters.dart';
import 'customer_model.dart';
import 'service_package_model.dart';
import 'customer_quota_model.dart';

part 'customer_subscription_model.freezed.dart';
part 'customer_subscription_model.g.dart';

@freezed
class CustomerSubscriptionModel with _$CustomerSubscriptionModel {
  const factory CustomerSubscriptionModel({
    required int id,
    required int customerId,
    required int servicePackageId,
    required String subscriptionCode,
    required double pricePaid,
    DateTime? purchaseDate,
    DateTime? expiredAt,
    required String status,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? remainingDays,
    @Default(false) bool isUnlimited,
    @Default('secondary') String statusBadgeVariant,
    @Default('') String statusLabel,
    CustomerModel? customer,
    ServicePackageModel? servicePackage,
    @Default([]) List<CustomerQuotaModel> customerQuotas,
  }) = _CustomerSubscriptionModel;

  const CustomerSubscriptionModel._();

  factory CustomerSubscriptionModel.fromJson(Map<String, dynamic> json) =>
      _$CustomerSubscriptionModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['customerId'] = toInt(json['customerId'] ?? json['customer_id']);
    normalized['servicePackageId'] = toInt(
      json['servicePackageId'] ?? json['service_package_id'],
    );
    normalized['subscriptionCode'] =
        json['subscriptionCode'] ?? json['subscription_code'] ?? '';
    normalized['pricePaid'] = toDouble(json['pricePaid'] ?? json['price_paid']);
    normalized['status'] = json['status'] ?? 'unknown';
    normalized['remainingDays'] = toIntOrNull(
      json['remainingDays'] ?? json['remaining_days'],
    );
    normalized['isUnlimited'] = toBool(
      json['isUnlimited'] ?? json['is_unlimited'],
    );
    normalized['statusBadgeVariant'] =
        json['statusBadgeVariant'] ??
        json['status_badge_variant'] ??
        'secondary';
    normalized['statusLabel'] =
        json['statusLabel'] ?? json['status_label'] ?? '';

    return normalized;
  }
}

extension CustomerSubscriptionModelX on CustomerSubscriptionModel {
  CustomerSubscription toEntity() => CustomerSubscription(
    id: id,
    customerId: customerId,
    servicePackageId: servicePackageId,
    subscriptionCode: subscriptionCode,
    pricePaid: pricePaid,
    purchaseDate: purchaseDate,
    expiredAt: expiredAt,
    status: status,
    createdAt: createdAt,
    updatedAt: updatedAt,
    remainingDays: remainingDays,
    isUnlimited: isUnlimited,
    statusBadgeVariant: statusBadgeVariant,
    statusLabel: statusLabel,
    customer: customer?.toEntity(),
    servicePackage: servicePackage?.toEntity(),
    customerQuotas: customerQuotas.map((e) => e.toEntity()).toList(),
  );
}
