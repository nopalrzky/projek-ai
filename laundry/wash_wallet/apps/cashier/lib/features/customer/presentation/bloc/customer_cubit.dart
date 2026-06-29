import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';
import '../../domain/usecases/store_membership_contract_usecase.dart';
import '../../domain/usecases/store_customer_subscription_usecase.dart';
import 'customer_state.dart';

class CustomerCubit extends Cubit<CustomerState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;
  final DestroyUsecase _destroyUsecase;
  final StoreMembershipContractUsecase _storeMembershipContractUsecase;
  final StoreCustomerSubscriptionUsecase _storeCustomerSubscriptionUsecase;

  CustomerCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
    required DestroyUsecase destroyUsecase,
    required StoreMembershipContractUsecase storeMembershipContractUsecase,
    required StoreCustomerSubscriptionUsecase storeCustomerSubscriptionUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       _destroyUsecase = destroyUsecase,
       _storeMembershipContractUsecase = storeMembershipContractUsecase,
       _storeCustomerSubscriptionUsecase = storeCustomerSubscriptionUsecase,
       super(const CustomerInitial());

  Future<void> getAll({
    required int outletId,
    String? search,
    String? phone,
    String? gender,
    bool? isActive,
    int page = 1,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) {
      emit(const CustomerLoading());
    }

    final params = GetAllParams(
      outletId: outletId,
      page: page,
      search: search,
      phone: phone,
      gender: gender,
      isActive: isActive,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (customers) {
        if (page == 1) {
          emit(
            CustomersLoaded(
              customers: customers,
              hasReachedMax: customers.length < 15,
              currentPage: page,
            ),
          );
        } else {
          final currentState = state;
          if (currentState is CustomersLoaded) {
            emit(
              currentState.copyWith(
                customers: currentState.customers + customers,
                hasReachedMax: customers.isEmpty || customers.length < 15,
                currentPage: page,
              ),
            );
          }
        }
      },
      failure: (failure) => emit(CustomerFailure(failure)),
    );
  }

  Future<void> getById(int id) async {
    emit(const CustomerLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (customer) => emit(CustomerDetailLoaded(customer)),
      failure: (failure) => emit(CustomerFailure(failure)),
    );
  }

  Future<void> store({
    required int outletId,
    required String name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
  }) async {
    emit(const CustomerLoading());

    final params = StoreCustomerParams(
      outletId: outletId,
      name: name,
      email: email,
      phone: phone,
      address: address,
      gender: gender,
      dateOfBirth: dateOfBirth,
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (customer) => emit(
        CustomerActionSuccess(
          'Pelanggan berhasil ditambahkan',
          customer: customer,
        ),
      ),
      failure: (failure) => emit(CustomerFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    String? name,
    String? email,
    String? phone,
    String? address,
    String? gender,
    String? dateOfBirth,
    bool? isActive,
    int? outletId,
  }) async {
    emit(const CustomerLoading());

    final params = UpdateCustomerParams(
      id: id,
      name: name,
      email: email,
      phone: phone,
      address: address,
      gender: gender,
      dateOfBirth: dateOfBirth,
      isActive: isActive,
      outletId: outletId,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (customer) => emit(
        CustomerActionSuccess(
          'Data pelanggan berhasil diperbarui',
          customer: customer,
        ),
      ),
      failure: (failure) => emit(CustomerFailure(failure)),
    );
  }

  Future<void> destroy(int id) async {
    emit(const CustomerLoading());

    final result = await _destroyUsecase(id);

    result.when(
      success: (_) => emit(const CustomerActionSuccess('Pelanggan berhasil dihapus')),
      failure: (failure) => emit(CustomerFailure(failure)),
    );
  }

  Future<void> storeMembershipContract({
    required int customerId,
    required int membershipPlanId,
    String? startAt,
    double? totalPaid,
  }) async {
    emit(const CustomerLoading());

    final result = await _storeMembershipContractUsecase(
      customerId: customerId,
      membershipPlanId: membershipPlanId,
      startAt: startAt,
      totalPaid: totalPaid,
    );

    result.when(
      success: (customer) => emit(
        CustomerActionSuccess('Membership berhasil dibuat', customer: customer),
      ),
      failure: (failure) => emit(CustomerFailure(failure)),
    );
  }

  Future<void> storeCustomerSubscription({
    required int customerId,
    required int servicePackageId,
    required double pricePaid,
    String? purchaseDate,
    String? note,
  }) async {
    emit(const CustomerLoading());

    final result = await _storeCustomerSubscriptionUsecase(
      customerId: customerId,
      servicePackageId: servicePackageId,
      pricePaid: pricePaid,
      purchaseDate: purchaseDate,
      note: note,
    );

    result.when(
      success: (customer) => emit(
        CustomerActionSuccess(
          'Subscription berhasil dibuat',
          customer: customer,
        ),
      ),
      failure: (failure) => emit(CustomerFailure(failure)),
    );
  }
}
