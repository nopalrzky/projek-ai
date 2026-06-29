import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/customer_topup.dart';

part 'customer_topup_model.freezed.dart';
part 'customer_topup_model.g.dart';

@freezed
class CustomerTopupModel with _$CustomerTopupModel {
  const factory CustomerTopupModel({
    required int id,
    @JsonKey(name: 'customer_account_id') required int customerAccountId,
    required int amount,
    required String status,
    @JsonKey(name: 'payment_status') required String paymentStatus,
    @JsonKey(name: 'payment_method') required String paymentMethod,
    @JsonKey(name: 'payment_provider') required String paymentProvider,
    @JsonKey(name: 'payment_data') Map<String, dynamic>? paymentData,
    @JsonKey(name: 'midtrans_order_id') String? midtransOrderId,
    @JsonKey(name: 'expired_at') DateTime? expiredAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _CustomerTopupModel;

  factory CustomerTopupModel.fromJson(Map<String, dynamic> json) =>
      _$CustomerTopupModelFromJson(json);

  factory CustomerTopupModel.fromEntity(CustomerTopup entity) {
    return CustomerTopupModel(
      id: entity.id,
      customerAccountId: entity.customerAccountId,
      amount: entity.amount,
      status: entity.status,
      paymentStatus: entity.paymentStatus,
      paymentMethod: entity.paymentMethod,
      paymentProvider: entity.paymentProvider,
      paymentData: entity.paymentData,
      midtransOrderId: entity.midtransOrderId,
      expiredAt: entity.expiredAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }
}

extension CustomerTopupModelX on CustomerTopupModel {
  CustomerTopup toEntity() {
    return CustomerTopup(
      id: id,
      customerAccountId: customerAccountId,
      amount: amount,
      status: status,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      paymentProvider: paymentProvider,
      paymentData: paymentData,
      midtransOrderId: midtransOrderId,
      expiredAt: expiredAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
