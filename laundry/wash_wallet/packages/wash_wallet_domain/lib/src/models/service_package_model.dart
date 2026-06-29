import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/service_package.dart';
import '../helpers/json_converters.dart';
import 'outlet_model.dart';
import 'customer_subscription_model.dart';

part 'service_package_model.freezed.dart';
part 'service_package_model.g.dart';

@freezed
class ServicePackageModel with _$ServicePackageModel {
  const factory ServicePackageModel({
    required int id,
    int? outletId,
    required String name,
    required double price,
    int? validityDays,
    String? description,
    @Default(true) bool isActive,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,

    // Relational data
    OutletModel? outlet,
    @Default([]) List<dynamic> servicePackageItems,
    @Default([]) List<CustomerSubscriptionModel> customerSubscriptions,
    @Default(0) int servicePackageItemsCount,
    @Default(0) int customerSubscriptionsCount,
  }) = _ServicePackageModel;

  const ServicePackageModel._();

  factory ServicePackageModel.fromJson(Map<String, dynamic> json) =>
      _$ServicePackageModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['outletId'] = toIntOrNull(json['outletId'] ?? json['outlet_id']);
    normalized['validityDays'] = toIntOrNull(
      json['validityDays'] ?? json['validity_days'],
    );
    normalized['price'] = toDouble(json['price']);
    normalized['isActive'] = toBool(
      json['isActive'] ?? json['is_active'] ?? true,
    );

    normalized['createdAt'] = json['createdAt'] ?? json['created_at'];
    normalized['updatedAt'] = json['updatedAt'] ?? json['updated_at'];
    normalized['deletedAt'] = json['deletedAt'] ?? json['deleted_at'];

    normalized['servicePackageItemsCount'] = toInt(
      json['servicePackageItemsCount'] ??
          json['service_package_items_count'] ??
          0,
    );
    normalized['customerSubscriptionsCount'] = toInt(
      json['customerSubscriptionsCount'] ??
          json['customer_subscriptions_count'] ??
          0,
    );

    return normalized;
  }

  ServicePackage toEntity() => ServicePackage(
    id: id,
    outletId: outletId,
    name: name,
    price: price,
    validityDays: validityDays,
    description: description,
    isActive: isActive,
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
    outlet: outlet?.toEntity(),
    servicePackageItems: List<dynamic>.from(servicePackageItems),
    customerSubscriptions: customerSubscriptions
        .map((e) => e.toEntity())
        .toList(),
    servicePackageItemsCount: servicePackageItemsCount,
    customerSubscriptionsCount: customerSubscriptionsCount,
  );

  factory ServicePackageModel.fromEntity(ServicePackage entity) =>
      ServicePackageModel(
        id: entity.id,
        outletId: entity.outletId,
        name: entity.name,
        price: entity.price,
        validityDays: entity.validityDays,
        description: entity.description,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        servicePackageItemsCount: entity.servicePackageItemsCount,
        customerSubscriptionsCount: entity.customerSubscriptionsCount,
      );
}
