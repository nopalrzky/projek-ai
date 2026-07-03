import 'package:freezed_annotation/freezed_annotation.dart';
import 'laundry_service_model.dart';
import '../entities/category.dart';

part 'category_model.freezed.dart';
part 'category_model.g.dart';

@freezed
class CategoryModel with _$CategoryModel {
  const factory CategoryModel({
    required int id,
    int? outletId,
    required String name,
    required String slug,
    String? description,
    required bool isActive,
    @Default(0) int laundryServicesCount,
    List<LaundryServiceModel>? laundryServices,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);

  factory CategoryModel.fromEntity(Category entity) => CategoryModel(
    id: entity.id,
    outletId: entity.outletId,
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    isActive: entity.isActive,
    laundryServicesCount: entity.laundryServicesCount,
    laundryServices: entity.laundryServices
        ?.map((e) => LaundryServiceModel.fromEntity(e))
        .toList(),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
  );
}

extension CategoryModelX on CategoryModel {
  Category toEntity() => Category(
    id: id,
    outletId: outletId,
    name: name,
    slug: slug,
    description: description,
    isActive: isActive,
    laundryServicesCount: laundryServicesCount,
    laundryServices: laundryServices?.map((e) => e.toEntity()).toList(),
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
  );
}
