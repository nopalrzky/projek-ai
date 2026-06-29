import 'package:hive_flutter/hive_flutter.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CategoryLocalDatasource {
  Future<void> cacheCategories(List<CategoryModel> categories, int outletId);
  Future<List<CategoryModel>> getCachedCategories(int outletId);
  Future<void> clearCategories(int outletId);
  Future<void> clearAllCategories();

  Future<void> cacheCategoryDetail(CategoryModel category);
  Future<CategoryModel?> getCachedCategoryById(int id);
  Future<void> clearCategoryDetail(int id);
}

class CategoryLocalDatasourceImpl implements CategoryLocalDatasource {
  static const String _boxName = 'categories';
  static const String _detailBoxName = 'category_details';

  Box<dynamic>? _box;
  Box<dynamic>? _detailBox;

  Future<Box<dynamic>> get box async {
    if (_box != null && _box!.isOpen) return _box!;
    _box = await Hive.openBox<dynamic>(_boxName);
    return _box!;
  }

  Future<Box<dynamic>> get detailBox async {
    if (_detailBox != null && _detailBox!.isOpen) return _detailBox!;
    _detailBox = await Hive.openBox<dynamic>(_detailBoxName);
    return _detailBox!;
  }

  String _generateKey(int outletId) => 'categories_$outletId';
  String _generateDetailKey(int id) => 'category_detail_$id';

  @override
  Future<void> cacheCategories(
    List<CategoryModel> categories,
    int outletId,
  ) async {
    try {
      final storageBox = await box;
      final key = _generateKey(outletId);

      final categoriesJson = categories.map((e) => e.toJson()).toList();
      await storageBox.put(key, categoriesJson);
    } catch (e) {
      throw Exception('Failed to cache categories: $e');
    }
  }

  @override
  Future<List<CategoryModel>> getCachedCategories(int outletId) async {
    try {
      final storageBox = await box;
      final key = _generateKey(outletId);

      final cachedData = storageBox.get(key);

      if (cachedData == null) {
        return [];
      }

      if (cachedData is List) {
        return cachedData
            .map((json) {
              try {
                return CategoryModel.fromJson(Map<String, dynamic>.from(json));
              } catch (_) {
                return null;
              }
            })
            .whereType<CategoryModel>()
            .toList();
      }

      return [];
    } catch (e) {
      throw Exception('Failed to get cached categories: $e');
    }
  }

  @override
  Future<void> clearCategories(int outletId) async {
    try {
      final storageBox = await box;
      final key = _generateKey(outletId);
      await storageBox.delete(key);
    } catch (e) {
      throw Exception('Failed to clear categories: $e');
    }
  }

  @override
  Future<void> clearAllCategories() async {
    try {
      final storageBox = await box;
      final detailStorageBox = await detailBox;
      await storageBox.clear();
      await detailStorageBox.clear();
    } catch (e) {
      throw Exception('Failed to clear all categories: $e');
    }
  }

  @override
  Future<void> cacheCategoryDetail(CategoryModel category) async {
    try {
      final storageBox = await detailBox;
      final key = _generateDetailKey(category.id);

      final categoryJson = category.toJson();

      await storageBox.put(key, categoryJson);
    } catch (e) {
      throw Exception('Failed to cache category detail: $e');
    }
  }

  @override
  Future<CategoryModel?> getCachedCategoryById(int id) async {
    try {
      final storageBox = await detailBox;
      final key = _generateDetailKey(id);

      final cachedData = storageBox.get(key);

      if (cachedData == null) {
        return null;
      }

      return CategoryModel.fromJson(Map<String, dynamic>.from(cachedData));
    } catch (e) {
      throw Exception('Failed to get cached category detail: $e');
    }
  }

  @override
  Future<void> clearCategoryDetail(int id) async {
    try {
      final storageBox = await detailBox;
      final key = _generateDetailKey(id);
      await storageBox.delete(key);
    } catch (e) {
      throw Exception('Failed to clear category detail: $e');
    }
  }
}
