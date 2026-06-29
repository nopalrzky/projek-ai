import 'package:equatable/equatable.dart';
import 'laundry_service.dart';

class Category extends Equatable {
  final int id;
  final int? outletId;
  final String name;
  final String slug;
  final String? description;
  final bool isActive;
  final int laundryServicesCount;
  final List<LaundryService>? laundryServices;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? deletedAt;

  const Category({
    required this.id,
    this.outletId,
    required this.name,
    required this.slug,
    this.description,
    required this.isActive,
    this.laundryServicesCount = 0,
    this.laundryServices,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  factory Category.fromModel(dynamic model) {
    return Category(
      id: model.id,
      outletId: model.outletId,
      name: model.name,
      slug: model.slug,
      description: model.description,
      isActive: model.isActive,
      laundryServicesCount: model.laundryServicesCount,
      laundryServices: model.laundryServices
          ?.map((e) => LaundryService.fromModel(e))
          .toList(),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    outletId,
    name,
    slug,
    description,
    isActive,
    laundryServicesCount,
    laundryServices,
    createdAt,
    updatedAt,
    deletedAt,
  ];
}
