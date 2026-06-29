import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_repository.dart';

class UpdateCustomerParams {
  final int id;
  final String? name;
  final String? email;
  final String? phone;
  final String? address;
  final String? gender;
  final String? dateOfBirth;
  final bool? isActive;
  final int? outletId;

  UpdateCustomerParams({
    required this.id,
    this.name,
    this.email,
    this.phone,
    this.address,
    this.gender,
    this.dateOfBirth,
    this.isActive,
    this.outletId,
  });
}

class UpdateUsecase {
  final CustomerRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<Customer>> call(UpdateCustomerParams params) async {
    return await _repository.update(
      id: params.id,
      name: params.name,
      email: params.email,
      phone: params.phone,
      address: params.address,
      gender: params.gender,
      dateOfBirth: params.dateOfBirth,
      isActive: params.isActive,
      outletId: params.outletId,
    );
  }
}
