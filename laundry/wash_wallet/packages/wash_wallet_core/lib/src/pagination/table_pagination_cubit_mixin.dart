import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/paginated_data.dart';
import '../result/result.dart';
import '../failures/failure.dart';

/// Mixin that centralises the "tablet page-change" boilerplate for any
/// [Cubit] that manages a paginated list.
///
/// Usage (inside a cubit that already has [S] as its state type):
/// ```dart
/// class MyCubit extends Cubit<MyState> with TablePaginationCubitMixin<MyState> {
///   Future<void> changePage(int page, {String search = ''}) =>
///     changePageGeneric<MyItem>(
///       page: page,
///       currentPage: (state as MyItemsLoaded).currentPage,
///       lastPage:    (state as MyItemsLoaded).lastPage,
///       request:     () => _getAllUsecase(page: page, search: search),
///       markPageLoading: () => (state as MyItemsLoaded).copyWith(isPageLoading: true),
///       buildLoaded:     (data) => MyItemsLoaded(items: data.items, ...),
///       buildError:      (f)    => MyError(f.message),
///     );
/// }
/// ```
///
/// Guards:
/// - no-op if [page] equals [currentPage] (prevents redundant fetch)
/// - no-op if [page] < 1 or [page] > [lastPage] (prevents invalid fetch)
/// - emits [markPageLoading()] before the request so the UI can disable
///   pagination controls while loading
/// - on success, emits [buildLoaded(data)] — ALWAYS replaces items, never appends
/// - on failure, emits [buildError(failure)]
mixin TablePaginationCubitMixin<S> on Cubit<S> {
  Future<void> changePageGeneric<Item>({
    required int page,
    required int currentPage,
    required int lastPage,
    required Future<Result<PaginatedData<Item>>> Function() request,
    required S Function() markPageLoading,
    required S Function(PaginatedData<Item> data) buildLoaded,
    required S Function(Failure failure) buildError,
  }) async {
    if (page == currentPage) return;
    if (page < 1 || page > lastPage) return;
    emit(markPageLoading());
    final result = await request();
    result.when(
      success: (data) => emit(buildLoaded(data)),
      failure: (failure) => emit(buildError(failure)),
    );
  }
}
