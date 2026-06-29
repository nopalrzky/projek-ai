import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/customer_quota.dart';
import '../helpers/json_converters.dart';

part 'customer_quota_model.freezed.dart';
part 'customer_quota_model.g.dart';

@freezed
class CustomerQuotaModel with _$CustomerQuotaModel {
  const factory CustomerQuotaModel({
    required int id,
    required int customerSubscriptionId,
    required int laundryServiceId,
    String? laundryServiceName,
    String? unit,
    required double totalQuota,
    required double remainingQuota,
  }) = _CustomerQuotaModel;

  const CustomerQuotaModel._();

  factory CustomerQuotaModel.fromJson(Map<String, dynamic> json) =>
      _$CustomerQuotaModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['customerSubscriptionId'] = toInt(
      json['customerSubscriptionId'] ?? json['customer_subscription_id'],
    );

    final laundryServiceData =
        json['laundryService'] ?? json['laundry_service'];
    final laundryServiceIdRaw =
        json['laundryServiceId'] ??
        json['laundry_service_id'] ??
        (laundryServiceData is Map ? laundryServiceData['id'] : null);
    normalized['laundryServiceId'] = toInt(laundryServiceIdRaw);

    if (laundryServiceData is Map) {
      normalized['laundryServiceName'] ??= laundryServiceData['name']
          ?.toString();
    }

    normalized['totalQuota'] = toDouble(
      json['totalQuota'] ?? json['total_quantity'],
    );
    normalized['remainingQuota'] = toDouble(
      json['remainingQuota'] ??
          (json['remaining_quota'] ??
              (json['total_quantity'] != null
                  ? (normalized['totalQuota'] - toDouble(json['used_quantity']))
                  : 0.0)),
    );

    return normalized;
  }
}

extension CustomerQuotaModelX on CustomerQuotaModel {
  CustomerQuota toEntity() => CustomerQuota(
    id: id,
    customerSubscriptionId: customerSubscriptionId,
    laundryServiceId: laundryServiceId,
    laundryServiceName: laundryServiceName,
    unit: unit,
    totalQuota: totalQuota,
    remainingQuota: remainingQuota,
  );
}
