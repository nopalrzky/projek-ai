import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class WaNotificationRepository {
  Future<Result<WaNotificationPreview>> getPreview(int orderId);
  Future<Result<Map<String, dynamic>>> sendNotification(
    int orderId, {
    String? clientRequestId,
  });
}
