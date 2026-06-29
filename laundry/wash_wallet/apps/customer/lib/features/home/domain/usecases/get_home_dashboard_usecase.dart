import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/home_dashboard.dart';
import '../repositories/home_repository.dart';

class GetHomeDashboardUsecase {
  final HomeRepository _repository;

  GetHomeDashboardUsecase(this._repository);

  Future<Result<HomeDashboard>> call() {
    return _repository.getHomeDashboard();
  }
}
