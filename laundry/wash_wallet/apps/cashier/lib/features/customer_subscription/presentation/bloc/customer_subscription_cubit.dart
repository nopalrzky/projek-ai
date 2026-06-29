import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import 'customer_subscription_state.dart';

class CustomerSubscriptionCubit extends Cubit<CustomerSubscriptionState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;
  final DestroyUsecase _destroyUsecase;

  CustomerSubscriptionCubit({
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
       super(const CustomerSubscriptionInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? customerId,
    int? outletId,
    int? servicePackageId,
    String? minPurchaseDate,
    String? maxPurchaseDate,
    String? expiryAtFrom,
    String? expiryAtTo,
    double? minPricePaid,
    double? maxPricePaid,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) {
      emit(const CustomerSubscriptionLoading());
    }

    final params = GetCustomerSubscriptionsParams(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      customerId: customerId,
      outletId: outletId,
      servicePackageId: servicePackageId,
      minPurchaseDate: minPurchaseDate,
      maxPurchaseDate: maxPurchaseDate,
      expiryAtFrom: expiryAtFrom,
      expiryAtTo: expiryAtTo,
      minPricePaid: minPricePaid,
      maxPricePaid: maxPricePaid,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (subscriptions) {
        if (page == 1) {
          emit(
            CustomerSubscriptionsLoaded(
              subscriptions: subscriptions,
              hasReachedMax: subscriptions.length < perPage,
              currentPage: page,
            ),
          );
        } else {
          final currentState = state;
          if (currentState is CustomerSubscriptionsLoaded) {
            emit(
              currentState.copyWith(
                subscriptions: currentState.subscriptions + subscriptions,
                hasReachedMax: subscriptions.isEmpty || subscriptions.length < perPage,
                currentPage: page,
              ),
            );
          }
        }
      },
      failure: (failure) => emit(CustomerSubscriptionFailure(failure)),
    );
  }

  Future<void> getById(int id) async {
    emit(const CustomerSubscriptionLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (subscription) => emit(CustomerSubscriptionDetailLoaded(subscription)),
      failure: (failure) => emit(CustomerSubscriptionFailure(failure)),
    );
  }

  Future<void> store({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  }) async {
    emit(const CustomerSubscriptionLoading());

    final params = StoreCustomerSubscriptionParams(
      customerId: customerId,
      servicePackageId: servicePackageId,
      pricePaid: pricePaid,
      purchaseDate: purchaseDate,
      note: note,
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (subscription) => emit(
        CustomerSubscriptionActionSuccess(
          'Customer subscription created successfully',
          subscription: subscription,
        ),
      ),
      failure: (failure) => emit(CustomerSubscriptionFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    String? status,
    String? note,
  }) async {
    emit(const CustomerSubscriptionLoading());

    final params = UpdateCustomerSubscriptionParams(
      customerSubscriptionId: id,
      status: status,
      note: note,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (subscription) => emit(
        CustomerSubscriptionActionSuccess(
          'Customer subscription updated successfully',
          subscription: subscription,
        ),
      ),
      failure: (failure) => emit(CustomerSubscriptionFailure(failure)),
    );
  }

  Future<void> destroy(int id) async {
    emit(const CustomerSubscriptionLoading());

    final result = await _destroyUsecase(id);

    result.when(
      success: (_) => emit(
        const CustomerSubscriptionActionSuccess(
          'Customer subscription deleted successfully',
        ),
      ),
      failure: (failure) => emit(CustomerSubscriptionFailure(failure)),
    );
  }

  // Legacy helper methods
  Future<void> loadCustomerSubscriptionsByCustomerId({
    required int customerId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    await getAll(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      customerId: customerId,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }

  Future<void> loadCustomerSubscriptionsByOutletId({
    required int outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    await getAll(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      outletId: outletId,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }

  Future<void> refreshSubscriptions({
    required int customerId,
    String? search,
    String? status,
  }) async {
    await getAll(
      customerId: customerId,
      page: 1,
      search: search,
      status: status,
    );
  }
}
