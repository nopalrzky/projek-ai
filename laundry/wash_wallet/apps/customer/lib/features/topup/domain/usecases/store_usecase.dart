import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/topup_repository.dart';

class StoreUsecase {
  final TopupRepository _repository;

  StoreUsecase(this._repository);

  Future<Either<Failure, CustomerTopup>> call(Map<String, dynamic> payload) {
    return _repository.store(payload);
  }
}
