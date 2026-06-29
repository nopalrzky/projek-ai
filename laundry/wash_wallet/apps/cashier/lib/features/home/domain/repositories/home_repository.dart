import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/home.dart';

abstract class HomeRepository {
  Future<Result<Home>> getHomeData();
}
