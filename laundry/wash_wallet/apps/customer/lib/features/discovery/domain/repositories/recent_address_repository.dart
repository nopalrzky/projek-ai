import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../../customer_address/domain/entities/customer_address.dart';

abstract class RecentAddressRepository {
  Future<Result<List<CustomerAddress>>> getAll();

  Future<Result<void>> save(CustomerAddress address);

  Future<Result<void>> clear();
}
