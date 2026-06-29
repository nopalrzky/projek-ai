import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/destroy_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import 'customer_address_action_state.dart';

class CustomerAddressActionCubit extends Cubit<CustomerAddressActionState> {
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;
  final DestroyUsecase _destroyUsecase;

  CustomerAddressActionCubit({
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
    required DestroyUsecase destroyUsecase,
  }) : _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       _destroyUsecase = destroyUsecase,
       super(const CustomerAddressActionInitial());

  Future<void> store({
    required String label,
    required String recipientName,
    required String recipientPhone,
    required String street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  }) async {
    emit(const CustomerAddressActionLoading());

    final result = await _storeUsecase(
      StoreCustomerAddressParams(
        label: label,
        recipientName: recipientName,
        recipientPhone: recipientPhone,
        street: street,
        notes: notes,
        latitude: latitude,
        longitude: longitude,
        isPrimary: isPrimary,
        villageId: villageId,
        districtId: districtId,
        regencyId: regencyId,
        provinceId: provinceId,
        villageName: villageName,
        districtName: districtName,
        regencyName: regencyName,
        provinceName: provinceName,
      ),
    );

    result.when(
      success: (address) => emit(
        CustomerAddressActionSuccess(
          'Alamat berhasil dibuat',
          address: address,
        ),
      ),
      failure: (failure) => emit(CustomerAddressActionFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    String? label,
    String? recipientName,
    String? recipientPhone,
    String? street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  }) async {
    emit(const CustomerAddressActionLoading());

    final result = await _updateUsecase(
      UpdateCustomerAddressParams(
        id: id,
        label: label,
        recipientName: recipientName,
        recipientPhone: recipientPhone,
        street: street,
        notes: notes,
        latitude: latitude,
        longitude: longitude,
        isPrimary: isPrimary,
        villageId: villageId,
        districtId: districtId,
        regencyId: regencyId,
        provinceId: provinceId,
        villageName: villageName,
        districtName: districtName,
        regencyName: regencyName,
        provinceName: provinceName,
      ),
    );

    result.when(
      success: (address) => emit(
        CustomerAddressActionSuccess(
          'Alamat berhasil diperbarui',
          address: address,
        ),
      ),
      failure: (failure) => emit(CustomerAddressActionFailure(failure)),
    );
  }

  Future<void> destroy(int id) async {
    emit(const CustomerAddressActionLoading());

    final result = await _destroyUsecase(id);

    result.when(
      success: (_) =>
          emit(const CustomerAddressActionSuccess('Alamat berhasil dihapus')),
      failure: (failure) => emit(CustomerAddressActionFailure(failure)),
    );
  }
}
