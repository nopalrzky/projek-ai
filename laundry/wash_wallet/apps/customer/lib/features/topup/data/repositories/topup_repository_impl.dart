import 'package:dartz/dartz.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../datasources/topup_remote_datasource.dart';
import '../../domain/repositories/topup_repository.dart';

class TopupRepositoryImpl implements TopupRepository {
  final TopupRemoteDatasource _remoteDatasource;

  TopupRepositoryImpl(this._remoteDatasource);

  @override
  Future<Either<Failure, CustomerTopup>> store(
    Map<String, dynamic> payload,
  ) async {
    try {
      final model = await _remoteDatasource.store(payload);
      return Right(model.toEntity());
    } on ApiException catch (e) {
      return Left(ServerFailure(message: e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<CustomerTopup>>> getAll() async {
    try {
      final models = await _remoteDatasource.getAll();
      return Right(models.map((e) => e.toEntity()).toList());
    } on ApiException catch (e) {
      return Left(ServerFailure(message: e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, CustomerTopup>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Right(model.toEntity());
    } on ApiException catch (e) {
      return Left(ServerFailure(message: e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
