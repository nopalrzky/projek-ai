import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../../customer_address/domain/entities/customer_address.dart';
import '../../domain/repositories/recent_address_repository.dart';
import '../datasources/recent_address_local_datasource.dart';

class RecentAddressRepositoryImpl implements RecentAddressRepository {
  final RecentAddressLocalDatasource _localDatasource;

  RecentAddressRepositoryImpl(this._localDatasource);

  @override
  Future<Result<List<CustomerAddress>>> getAll() async {
    try {
      return Result.success(await _localDatasource.getAll());
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<void>> save(CustomerAddress address) async {
    try {
      await _localDatasource.save(address);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<void>> clear() async {
    try {
      await _localDatasource.clear();
      return const Result.success(null);
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
