import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/service_package_repository.dart';

class GetByIdUsecase {
  final ServicePackageRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<ServicePackage>> call(int servicePackageId) async {
    return _repository.getById(servicePackageId: servicePackageId);
  }
}
