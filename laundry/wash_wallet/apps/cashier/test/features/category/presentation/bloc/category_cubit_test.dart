import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_cashier/features/category/presentation/bloc/category_cubit.dart';
import 'package:wash_wallet_cashier/features/category/presentation/bloc/category_state.dart';
import 'package:wash_wallet_cashier/features/category/domain/usecases/get_all_usecase.dart';
import 'package:wash_wallet_cashier/features/category/domain/usecases/get_by_id_usecase.dart';
import 'package:wash_wallet_cashier/features/category/domain/usecases/store_usecase.dart';
import 'package:wash_wallet_cashier/features/category/domain/usecases/update_usecase.dart';
import 'package:wash_wallet_cashier/features/category/domain/usecases/destroy_usecase.dart';

class MockGetAllUsecase implements GetAllUsecase {
  Future<Result<PaginatedData<Category>>> Function({
    int? outletId,
    int page,
    int perPage,
    String? search,
    bool? isActive,
    String sortBy,
    String sortDirection,
    bool forceRefresh,
  })? callMock;

  @override
  Future<Result<PaginatedData<Category>>> call({
    int? outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
    bool forceRefresh = false,
  }) {
    if (callMock != null) {
      return callMock!(
        outletId: outletId,
        page: page,
        perPage: perPage,
        search: search,
        isActive: isActive,
        sortBy: sortBy,
        sortDirection: sortDirection,
        forceRefresh: forceRefresh,
      );
    }
    throw UnimplementedError();
  }
}

class MockGetByIdUsecase implements GetByIdUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockStoreUsecase implements StoreUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockUpdateUsecase implements UpdateUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockDestroyUsecase implements DestroyUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  late CategoryCubit categoryCubit;
  late MockGetAllUsecase mockGetAllUsecase;
  late MockGetByIdUsecase mockGetByIdUsecase;
  late MockStoreUsecase mockStoreUsecase;
  late MockUpdateUsecase mockUpdateUsecase;
  late MockDestroyUsecase mockDestroyUsecase;

  setUp(() {
    mockGetAllUsecase = MockGetAllUsecase();
    mockGetByIdUsecase = MockGetByIdUsecase();
    mockStoreUsecase = MockStoreUsecase();
    mockUpdateUsecase = MockUpdateUsecase();
    mockDestroyUsecase = MockDestroyUsecase();

    categoryCubit = CategoryCubit(
      getAllUsecase: mockGetAllUsecase,
      getByIdUsecase: mockGetByIdUsecase,
      storeUsecase: mockStoreUsecase,
      updateUsecase: mockUpdateUsecase,
      destroyUsecase: mockDestroyUsecase,
    );
  });

  tearDown(() {
    categoryCubit.close();
  });

  final tCategory1 = const Category(
    id: 1,
    name: 'Kiloan',
    slug: 'kiloan',
    isActive: true,
  );

  final tCategory2 = const Category(
    id: 2,
    name: 'Satuan',
    slug: 'satuan',
    isActive: true,
  );

  test('initial state is CategoryInitial', () {
    expect(categoryCubit.state, const CategoryInitial());
  });

  group('getAll', () {
    test('emits CategoryLoading then CategoriesLoaded with page=1', () async {
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        return Result.success(PaginatedData<Category>(
          items: [tCategory1],
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      final states = <CategoryState>[];
      final subscription = categoryCubit.stream.listen(states.add);

      await categoryCubit.getAll(page: 1);

      expect(states[0], const CategoryLoading());
      expect(
        states[1],
        CategoriesLoaded(
          categories: [tCategory1],
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ),
      );

      subscription.cancel();
    });

    test('emits CategoriesLoaded with appended items when page > 1', () async {
      // Setup initial state: loaded page 1
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        return Result.success(PaginatedData<Category>(
          items: [tCategory1],
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      await categoryCubit.getAll(page: 1);

      // Now query page 2
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        return Result.success(PaginatedData<Category>(
          items: [tCategory2],
          currentPage: 2,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      final states = <CategoryState>[];
      final subscription = categoryCubit.stream.listen(states.add);

      await categoryCubit.getAll(page: 2);

      expect(
        states[0],
        CategoriesLoaded(
          categories: [tCategory1, tCategory2],
          currentPage: 2,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ),
      );

      subscription.cancel();
    });
  });

  group('changePage', () {
    test('does nothing if current state is not CategoriesLoaded', () async {
      int callCount = 0;
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        callCount++;
        return Result.success(PaginatedData<Category>(
          items: [tCategory2],
          currentPage: 2,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      await categoryCubit.changePage(2);
      expect(callCount, 0);
    });

    test('replaces (not appends) items, and triggers load state', () async {
      // 1. Initial load
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        return Result.success(PaginatedData<Category>(
          items: [tCategory1],
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      await categoryCubit.getAll(page: 1);

      // 2. Change page
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        return Result.success(PaginatedData<Category>(
          items: [tCategory2],
          currentPage: 2,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      final states = <CategoryState>[];
      final subscription = categoryCubit.stream.listen(states.add);

      await categoryCubit.changePage(2);

      // Should emit loading with isPageLoading=true, then loaded only page 2 item
      expect(
        states[0],
        CategoriesLoaded(
          categories: [tCategory1],
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
          total: 2,
          isPageLoading: true,
        ),
      );
      expect(
        states[1],
        CategoriesLoaded(
          categories: [tCategory2],
          currentPage: 2,
          lastPage: 2,
          perPage: 15,
          total: 2,
          isPageLoading: false,
        ),
      );

      subscription.cancel();
    });

    test('does nothing if requested page is the current page', () async {
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        return Result.success(PaginatedData<Category>(
          items: [tCategory1],
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      await categoryCubit.getAll(page: 1);

      int callCount = 0;
      mockGetAllUsecase.callMock = ({
        int? outletId,
        int page = 1,
        int perPage = 15,
        String? search,
        bool? isActive,
        String sortBy = 'created_at',
        String sortDirection = 'desc',
        bool forceRefresh = false,
      }) async {
        callCount++;
        return Result.success(PaginatedData<Category>(
          items: [tCategory2],
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
          total: 2,
        ));
      };

      await categoryCubit.changePage(1);
      expect(callCount, 0);
    });
  });
}
