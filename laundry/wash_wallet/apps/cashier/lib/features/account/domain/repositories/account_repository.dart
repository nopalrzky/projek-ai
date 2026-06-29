import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class AccountRepository {
  Future<Result<List<Account>>> getAll({
    required int outletId,
    required String type,
  });
}
