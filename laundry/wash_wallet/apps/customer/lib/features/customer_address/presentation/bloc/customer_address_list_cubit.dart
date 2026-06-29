import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import 'customer_address_list_state.dart';

class CustomerAddressListCubit extends Cubit<CustomerAddressListState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;

  CustomerAddressListCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       super(const CustomerAddressListInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isPrimary,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    bool forceRefresh = false,
  }) async {
    if (page == 1 || forceRefresh) {
      emit(const CustomerAddressListLoading());
    }

    final result = await _getAllUsecase(
      page: page,
      perPage: perPage,
      search: search,
      isPrimary: isPrimary,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    result.when(
      success: (addresses) {
        if (page == 1 || forceRefresh || state is! CustomerAddressListSuccess) {
          emit(
            CustomerAddressListSuccess(
              addresses: addresses,
              hasReachedMax: addresses.length < perPage,
              currentPage: page,
            ),
          );
          return;
        }

        final currentState = state;
        if (currentState is CustomerAddressListSuccess) {
          emit(
            currentState.copyWith(
              addresses: [...currentState.addresses, ...addresses],
              hasReachedMax: addresses.isEmpty || addresses.length < perPage,
              currentPage: page,
            ),
          );
        }
      },
      failure: (failure) => emit(CustomerAddressListFailure(failure)),
    );
  }

  Future<void> getById(int id) async {
    emit(const CustomerAddressListLoading());

    final result = await _getByIdUsecase(id: id);
    result.when(
      success: (address) {
        emit(
          CustomerAddressListSuccess(
            addresses: [address],
            hasReachedMax: true,
            currentPage: 1,
          ),
        );
      },
      failure: (failure) => emit(CustomerAddressListFailure(failure)),
    );
  }
}
