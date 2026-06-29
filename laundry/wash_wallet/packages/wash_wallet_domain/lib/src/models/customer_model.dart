import 'package:freezed_annotation/freezed_annotation.dart';
import '../helpers/json_converters.dart';
import '../entities/customer.dart';

part 'customer_model.freezed.dart';
part 'customer_model.g.dart';

@freezed
class CustomerModel with _$CustomerModel {
  const factory CustomerModel({
    required int id,
    int? outletId,
    required String name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    DateTime? dateOfBirth,
    required bool isActive,
    String? statusLabel,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    @Default(0) int ordersCount,
    @Default(0) int customerSubscriptionsCount,
    @Default(0) int membershipContractsCount,
  }) = _CustomerModel;

  const CustomerModel._();

  factory CustomerModel.fromJson(Map<String, dynamic> json) =>
      _$CustomerModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['outletId'] = toIntOrNull(json['outletId']);
    normalized['isActive'] = toBool(json['isActive']);
    normalized['ordersCount'] = toInt(json['ordersCount']);
    normalized['customerSubscriptionsCount'] = toInt(
      json['customerSubscriptionsCount'] ??
          json['customer_subscriptions_count'],
    );
    normalized['membershipContractsCount'] = toInt(
      json['membershipContractsCount'] ?? json['membership_contracts_count'],
    );

    return normalized;
  }

  factory CustomerModel.fromEntity(Customer entity) => CustomerModel(
    id: entity.id,
    outletId: entity.outletId,
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    address: entity.address,
    gender: entity.gender,
    dateOfBirth: entity.dateOfBirth,
    isActive: entity.isActive,
    statusLabel: entity.statusLabel,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    ordersCount: entity.ordersCount,
    customerSubscriptionsCount: entity.customerSubscriptionsCount,
    membershipContractsCount: entity.membershipContractsCount,
  );
}

extension CustomerModelX on CustomerModel {
  Customer toEntity() => Customer(
    id: id,
    outletId: outletId,
    name: name,
    email: email,
    phone: phone,
    address: address,
    gender: gender,
    dateOfBirth: dateOfBirth,
    isActive: isActive,
    statusLabel: statusLabel,
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
    ordersCount: ordersCount,
    customerSubscriptionsCount: customerSubscriptionsCount,
    membershipContractsCount: membershipContractsCount,
  );
}
