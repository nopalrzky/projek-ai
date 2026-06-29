import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/topup_repository.dart';

class GetAllUsecase {
  final TopupRepository _repository;

  GetAllUsecase(this._repository);

  Future<Either<Failure, List<CustomerTopup>>> call() {
    return _repository.getAll();
  }
}
