import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/customer_repository.dart';

class StoreCustomerParams {
  final int outletId;
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? gender;
  final String? dateOfBirth;

  StoreCustomerParams({
    required this.outletId,
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.gender,
    this.dateOfBirth,
  });
}

class StoreUsecase {
  final CustomerRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<Customer>> call(StoreCustomerParams params) async {
    return await _repository.store(
      outletId: params.outletId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      address: params.address,
      gender: params.gender,
      dateOfBirth: params.dateOfBirth,
    );
  }
}
