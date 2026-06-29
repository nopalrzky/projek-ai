import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/home.dart';
import '../repositories/home_repository.dart';

class GetHomeDataUsecase {
  final HomeRepository _repository;

  GetHomeDataUsecase(this._repository);

  Future<Result<Home>> call() async {
    return await _repository.getHomeData();
  }
}
