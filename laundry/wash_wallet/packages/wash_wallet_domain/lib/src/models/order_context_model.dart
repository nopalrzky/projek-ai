import 'package:freezed_annotation/freezed_annotation.dart';
import 'customer_model.dart';
import 'membership_context_model.dart';
import 'quota_context_model.dart';
import '../entities/order_context.dart';

part 'order_context_model.freezed.dart';
part 'order_context_model.g.dart';

@freezed
class OrderContextModel with _$OrderContextModel {
  const factory OrderContextModel({
    required CustomerModel customer,
    MembershipContextModel? membership,
    required List<QuotaContextModel> quotas,
  }) = _OrderContextModel;

  const OrderContextModel._();

  factory OrderContextModel.fromJson(Map<String, dynamic> json) =>
      _$OrderContextModelFromJson(json);

  factory OrderContextModel.fromResponse(Map<String, dynamic> response) {
    final data = response['data'] as Map<String, dynamic>;

    return OrderContextModel(
      customer: CustomerModel.fromJson(
        data['customer'] as Map<String, dynamic>,
      ),
      membership: data['membership'] != null
          ? MembershipContextModel.fromJson(
              data['membership'] as Map<String, dynamic>,
            )
          : null,
      quotas: (data['quotas'] as List<dynamic>)
          .map((e) => QuotaContextModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  OrderContext toEntity() => OrderContext(
    customer: customer.toEntity(),
    membership: membership?.toEntity(),
    quotas: quotas.map((e) => e.toEntity()).toList(),
  );
}
