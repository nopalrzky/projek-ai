import 'package:equatable/equatable.dart';
import 'unit.dart';
import 'category.dart';

class LaundryService extends Equatable {
  final int id;
  final int categoryId;
  final int unitId;
  final String name;
  final String? description;
  final double price;
  final int durationHours;
  final int minQuantity;
  final String slug;
  final bool isActive;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;
  final Unit? unit;
  final Category? category;
  final int laundryServiceProcessesCount;
  final int servicePackageItemsCount;
  final double? averageRating;
  final int? reviewsCount;
  final bool supportsCourier;
  final String? courierSupportLabel;
  final String? courierSupportMessage;

  const LaundryService({
    required this.id,
    required this.categoryId,
    required this.unitId,
    required this.name,
    this.description,
    required this.price,
    required this.durationHours,
    required this.minQuantity,
    required this.slug,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.unit,
    this.category,
    this.laundryServiceProcessesCount = 0,
    this.servicePackageItemsCount = 0,
    this.averageRating,
    this.reviewsCount,
    this.supportsCourier = true,
    this.courierSupportLabel,
    this.courierSupportMessage,
  });

  factory LaundryService.fromModel(dynamic model) {
    return LaundryService(
      id: model.id,
      categoryId: model.categoryId,
      unitId: model.unitId,
      name: model.name,
      description: model.description,
      price: model.price,
      durationHours: model.durationHours,
      minQuantity: model.minQuantity,
      slug: model.slug,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      unit: model.unit != null ? Unit.fromModel(model.unit) : null,
      category: model.category != null
          ? Category.fromModel(model.category)
          : null,
      laundryServiceProcessesCount: model.laundryServiceProcessesCount,
      servicePackageItemsCount: model.servicePackageItemsCount,
      averageRating: model.averageRating,
      reviewsCount: model.reviewsCount,
      supportsCourier: model.supportsCourier,
      courierSupportLabel: model.courierSupportLabel,
      courierSupportMessage: model.courierSupportMessage,
    );
  }

  @override
  List<Object?> get props => [
    id,
    categoryId,
    unitId,
    name,
    description,
    price,
    durationHours,
    minQuantity,
    slug,
    isActive,
    createdAt,
    updatedAt,
    deletedAt,
    unit,
    category,
    laundryServiceProcessesCount,
    servicePackageItemsCount,
    averageRating,
    reviewsCount,
    supportsCourier,
    courierSupportLabel,
    courierSupportMessage,
  ];
}
