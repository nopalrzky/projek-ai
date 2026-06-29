import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class TopupRepository {
  Future<Either<Failure, CustomerTopup>> store(Map<String, dynamic> payload);
  Future<Either<Failure, List<CustomerTopup>>> getAll();
  Future<Either<Failure, CustomerTopup>> getById(int id);
}
