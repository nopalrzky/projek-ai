import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../repositories/wa_notification_repository.dart';

class SendWaNotificationUsecase {
  final WaNotificationRepository _repository;

  SendWaNotificationUsecase(this._repository);

  Future<Result<Map<String, dynamic>>> call(int orderId) {
    return _repository.sendNotification(orderId);
  }
}
