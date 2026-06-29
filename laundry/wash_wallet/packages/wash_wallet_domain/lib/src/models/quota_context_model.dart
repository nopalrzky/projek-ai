import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/quota_context.dart';
import '../helpers/json_converters.dart';

part 'quota_context_model.freezed.dart';
part 'quota_context_model.g.dart';

@freezed
class QuotaContextModel with _$QuotaContextModel {
  const factory QuotaContextModel({
    required int laundryServiceId,
    required String laundryServiceName,
    required String unit,
    required double totalQuota,
    required double remainingQuota,
  }) = _QuotaContextModel;

  const QuotaContextModel._();

  factory QuotaContextModel.fromJson(Map<String, dynamic> json) =>
      _$QuotaContextModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['laundryServiceId'] = toInt(
      json['laundryServiceId'] ?? json['laundry_service_id'],
    );
    normalized['laundryServiceName'] =
        json['laundryServiceName'] ?? json['laundry_service_name'] ?? '';
    normalized['unit'] = json['unit'] ?? '';
    normalized['totalQuota'] = toDouble(
      json['totalQuota'] ?? json['total_quota'],
    );
    normalized['remainingQuota'] = toDouble(
      json['remainingQuota'] ?? json['remaining_quota'],
    );

    return normalized;
  }

  QuotaContext toEntity() => QuotaContext(
    laundryServiceId: laundryServiceId,
    laundryServiceName: laundryServiceName,
    unit: unit,
    totalQuota: totalQuota,
    remainingQuota: remainingQuota,
  );
}
