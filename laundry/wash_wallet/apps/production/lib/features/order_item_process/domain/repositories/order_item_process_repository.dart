import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderItemProcessRepository {
  Future<Result<OrderItemProcess>> start(int id);
  Future<Result<OrderItemProcess>> complete(int id);
}
