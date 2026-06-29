import 'package:freezed_annotation/freezed_annotation.dart';
import 'unit_model.dart';
import 'category_model.dart';
import '../entities/laundry_service.dart';
import '../helpers/json_converters.dart';

part 'laundry_service_model.freezed.dart';
part 'laundry_service_model.g.dart';

@freezed
class LaundryServiceModel with _$LaundryServiceModel {
  const factory LaundryServiceModel({
    required int id,
    required int categoryId,
    required int unitId,
    required String name,
    String? description,
    required double price,
    required int durationHours,
    required int minQuantity,
    required String slug,
    required bool isActive,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,

    UnitModel? unit,
    CategoryModel? category,
    @Default(0) int laundryServiceProcessesCount,
    @Default(0) int servicePackageItemsCount,
    double? averageRating,
    int? reviewsCount,
    @Default(true) bool supportsCourier,
    String? courierSupportLabel,
    String? courierSupportMessage,
  }) = _LaundryServiceModel;

  const LaundryServiceModel._();

  factory LaundryServiceModel.fromJson(Map<String, dynamic> json) =>
      _$LaundryServiceModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['categoryId'] = toInt(json['categoryId'] ?? json['category_id']);
    normalized['unitId'] = toInt(json['unitId'] ?? json['unit_id']);
    normalized['price'] = toDouble(json['price']);
    normalized['durationHours'] = toInt(
      json['durationHours'] ?? json['duration_hours'],
    );
    normalized['minQuantity'] = toInt(
      json['minQuantity'] ?? json['min_quantity'],
    );
    normalized['isActive'] = toBool(
      json['isActive'] ?? json['is_active'] ?? true,
    );

    normalized['createdAt'] = json['createdAt'] ?? json['created_at'];
    normalized['updatedAt'] = json['updatedAt'] ?? json['updated_at'];
    normalized['deletedAt'] = json['deletedAt'] ?? json['deleted_at'];

    normalized['laundryServiceProcessesCount'] = toInt(
      json['laundryServiceProcessesCount'] ??
          json['laundry_service_processes_count'] ??
          0,
    );
    normalized['servicePackageItemsCount'] = toInt(
      json['servicePackageItemsCount'] ??
          json['service_package_items_count'] ??
          0,
    );
    normalized['averageRating'] = toDoubleOrNull(
      json['averageRating'] ?? json['average_rating'],
    );
    normalized['reviewsCount'] = toIntOrNull(
      json['reviewsCount'] ?? json['totalReviews'] ?? json['total_reviews'] ?? json['reviews_count'],
    );
    
    normalized['supportsCourier'] = toBool(
      json['supportsCourier'] ?? json['supports_courier'] ?? true,
    );
    normalized['courierSupportLabel'] = json['courierSupportLabel'] ?? json['courier_support_label'];
    normalized['courierSupportMessage'] = json['courierSupportMessage'] ?? json['courier_support_message'];

    return normalized;
  }

  LaundryService toEntity() => LaundryService(
    id: id,
    categoryId: categoryId,
    unitId: unitId,
    name: name,
    description: description,
    price: price,
    durationHours: durationHours,
    minQuantity: minQuantity,
    slug: slug,
    isActive: isActive,
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
    unit: unit?.toEntity(),
    category: category?.toEntity(),
    laundryServiceProcessesCount: laundryServiceProcessesCount,
    servicePackageItemsCount: servicePackageItemsCount,
    averageRating: averageRating,
    reviewsCount: reviewsCount,
    supportsCourier: supportsCourier,
    courierSupportLabel: courierSupportLabel,
    courierSupportMessage: courierSupportMessage,
  );

  factory LaundryServiceModel.fromEntity(LaundryService entity) =>
      LaundryServiceModel(
        id: entity.id,
        categoryId: entity.categoryId,
        unitId: entity.unitId,
        name: entity.name,
        description: entity.description,
        price: entity.price,
        durationHours: entity.durationHours,
        minQuantity: entity.minQuantity,
        slug: entity.slug,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
        laundryServiceProcessesCount: entity.laundryServiceProcessesCount,
        servicePackageItemsCount: entity.servicePackageItemsCount,
        averageRating: entity.averageRating,
        reviewsCount: entity.reviewsCount,
        supportsCourier: entity.supportsCourier,
        courierSupportLabel: entity.courierSupportLabel,
        courierSupportMessage: entity.courierSupportMessage,
      );
}
