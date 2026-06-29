import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/topup_repository.dart';

class GetByIdUsecase {
  final TopupRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Either<Failure, CustomerTopup>> call(int id) {
    return _repository.getById(id);
  }
}
