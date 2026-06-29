import 'package:equatable/equatable.dart';

class ServicePackage extends Equatable {
  final int id;
  final int? outletId;
  final String name;
  final double price;
  final int? validityDays;
  final String? description;
  final bool isActive;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;
  final dynamic outlet;
  final List<dynamic> servicePackageItems;
  final List<dynamic> customerSubscriptions;
  final int servicePackageItemsCount;
  final int customerSubscriptionsCount;

  const ServicePackage({
    required this.id,
    this.outletId,
    required this.name,
    required this.price,
    this.validityDays,
    this.description,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.outlet,
    this.servicePackageItems = const [],
    this.customerSubscriptions = const [],
    this.servicePackageItemsCount = 0,
    this.customerSubscriptionsCount = 0,
  });

  factory ServicePackage.fromModel(dynamic model) {
    return ServicePackage(
      id: model.id,
      outletId: model.outletId,
      name: model.name,
      price: model.price,
      validityDays: model.validityDays,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      outlet: model.outlet,
      servicePackageItems: model.servicePackageItems ?? [],
      customerSubscriptions: model.customerSubscriptions ?? [],
      servicePackageItemsCount: model.servicePackageItemsCount,
      customerSubscriptionsCount: model.customerSubscriptionsCount,
    );
  }

  @override
  List<Object?> get props => [
    id,
    outletId,
    name,
    price,
    validityDays,
    description,
    isActive,
    createdAt,
    updatedAt,
    deletedAt,
    outlet,
    servicePackageItems,
    customerSubscriptions,
    servicePackageItemsCount,
    customerSubscriptionsCount,
  ];
}
