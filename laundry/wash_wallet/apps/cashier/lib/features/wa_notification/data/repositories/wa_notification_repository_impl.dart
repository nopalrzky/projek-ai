import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/wa_notification_repository.dart';
import '../datasources/wa_notification_remote_datasource.dart';

class WaNotificationRepositoryImpl implements WaNotificationRepository {
  final WaNotificationRemoteDatasource _remoteDatasource;

  WaNotificationRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<WaNotificationPreview>> getPreview(int orderId) async {
    try {
      final model = await _remoteDatasource.getPreview(orderId);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> sendNotification(
    int orderId, {
    String? clientRequestId,
  }) async {
    try {
      final response = await _remoteDatasource.sendNotification(
        orderId,
        clientRequestId: clientRequestId,
      );
      return Result.success(response);
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
