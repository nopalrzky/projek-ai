import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/wa_notification_repository.dart';

class GetWaNotificationPreviewUsecase {
  final WaNotificationRepository _repository;

  GetWaNotificationPreviewUsecase(this._repository);

  Future<Result<WaNotificationPreview>> call(int orderId) async {
    return await _repository.getPreview(orderId);
  }
}

