import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';

import 'category_state.dart';

class CategoryCubit extends Cubit<CategoryState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;
  final DestroyUsecase _destroyUsecase;

  CategoryCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
    required DestroyUsecase destroyUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       _destroyUsecase = destroyUsecase,
       super(const CategoryInitial());

  Future<void> getAll({
    int? outletId,
    String? search,
    bool? isActive,
    int page = 1,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
    bool forceRefresh = false,
  }) async {
    if (page == 1) {
      emit(const CategoryLoading());
    }

    final result = await _getAllUsecase(
      outletId: outletId,
      page: page,
      search: search,
      isActive: isActive,
      sortBy: sortBy,
      sortDirection: sortDirection,
      forceRefresh: forceRefresh,
    );

    result.when(
      success: (categories) {
        if (page == 1) {
          emit(
            CategoriesLoaded(
              categories: categories,
              hasReachedMax: categories.length < 15,
              currentPage: page,
            ),
          );
        } else {
          final currentState = state;
          if (currentState is CategoriesLoaded) {
            emit(
              currentState.copyWith(
                categories: currentState.categories + categories,
                hasReachedMax: categories.isEmpty || categories.length < 15,
                currentPage: page,
              ),
            );
          }
        }
      },
      failure: (failure) => emit(CategoryFailure(failure)),
    );
  }

  Future<void> getById({
    required int id,
    bool forceRefresh = false,
  }) async {
    emit(const CategoryLoading());

    final result = await _getByIdUsecase(id: id, forceRefresh: forceRefresh);

    result.when(
      success: (category) => emit(CategoryDetailLoaded(category)),
      failure: (failure) => emit(CategoryFailure(failure)),
    );
  }

  Future<void> store({
    required int outletId,
    required String name,
    String? description,
  }) async {
    emit(const CategoryLoading());

    final params = StoreCategoryParams(
      outletId: outletId,
      name: name,
      description: description,
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (category) => emit(
        CategoryActionSuccess('Kategori berhasil dibuat', category: category),
      ),
      failure: (failure) => emit(CategoryFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    String? name,
    String? description,
    bool? isActive,
    int? outletId,
  }) async {
    emit(const CategoryLoading());

    final params = UpdateCategoryParams(
      id: id,
      name: name,
      description: description,
      isActive: isActive,
      outletId: outletId,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (category) => emit(
        CategoryActionSuccess(
          'Kategori berhasil diperbarui',
          category: category,
        ),
      ),
      failure: (failure) => emit(CategoryFailure(failure)),
    );
  }

  Future<void> destroy(int id) async {
    emit(const CategoryLoading());

    final result = await _destroyUsecase(id);

    result.when(
      success: (_) =>
          emit(const CategoryActionSuccess('Kategori berhasil dihapus')),
      failure: (failure) => emit(CategoryFailure(failure)),
    );
  }
}
