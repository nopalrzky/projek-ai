import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/wa_notification_repository.dart';

class SendWaNotificationParams {
  final int orderId;
  final String? clientRequestId;

  SendWaNotificationParams({required this.orderId, this.clientRequestId});
}

class SendWaNotificationUsecase {
  final WaNotificationRepository _repository;

  SendWaNotificationUsecase(this._repository);

  Future<Result<Map<String, dynamic>>> execute(SendWaNotificationParams params) async {
    return _repository.sendNotification(params.orderId, clientRequestId: params.clientRequestId);
  }
}
