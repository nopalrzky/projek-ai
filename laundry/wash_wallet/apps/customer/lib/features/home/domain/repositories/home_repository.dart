import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/home_dashboard.dart';

abstract class HomeRepository {
  Future<Result<HomeDashboard>> getHomeDashboard();
}
