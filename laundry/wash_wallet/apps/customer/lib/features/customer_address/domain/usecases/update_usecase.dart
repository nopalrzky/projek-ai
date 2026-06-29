import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/customer_address.dart';
import '../repositories/customer_address_repository.dart';

class UpdateCustomerAddressParams {
  final int id;
  final String? label;
  final String? recipientName;
  final String? recipientPhone;
  final String? street;
  final String? notes;
  final double? latitude;
  final double? longitude;
  final bool? isPrimary;
  final String? villageId;
  final String? districtId;
  final String? regencyId;
  final String? provinceId;
  final String? villageName;
  final String? districtName;
  final String? regencyName;
  final String? provinceName;

  const UpdateCustomerAddressParams({
    required this.id,
    this.label,
    this.recipientName,
    this.recipientPhone,
    this.street,
    this.notes,
    this.latitude,
    this.longitude,
    this.isPrimary,
    this.villageId,
    this.districtId,
    this.regencyId,
    this.provinceId,
    this.villageName,
    this.districtName,
    this.regencyName,
    this.provinceName,
  });
}

class UpdateUsecase {
  final CustomerAddressRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<CustomerAddress>> call(UpdateCustomerAddressParams params) {
    return _repository.update(
      id: params.id,
      label: params.label,
      recipientName: params.recipientName,
      recipientPhone: params.recipientPhone,
      street: params.street,
      notes: params.notes,
      latitude: params.latitude,
      longitude: params.longitude,
      isPrimary: params.isPrimary,
      villageId: params.villageId,
      districtId: params.districtId,
      regencyId: params.regencyId,
      provinceId: params.provinceId,
      villageName: params.villageName,
      districtName: params.districtName,
      regencyName: params.regencyName,
      provinceName: params.provinceName,
    );
  }
}
