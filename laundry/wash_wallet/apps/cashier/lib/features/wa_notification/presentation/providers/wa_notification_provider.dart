import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/wa_notification_remote_datasource.dart';
import '../../data/repositories/wa_notification_repository_impl.dart';
import '../../domain/repositories/wa_notification_repository.dart';
import '../../domain/usecases/get_wa_notification_preview_usecase.dart';
import '../../domain/usecases/send_wa_notification_usecase.dart';
import '../bloc/wa_notification_cubit.dart';

class WaNotificationProvider {
  WaNotificationProvider._();

  static WaNotificationRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return WaNotificationRemoteDatasourceImpl(dio, endpoints);
  }

  static WaNotificationRepository createRepository(
    WaNotificationRemoteDatasource remoteDatasource,
  ) {
    return WaNotificationRepositoryImpl(remoteDatasource);
  }

  static GetWaNotificationPreviewUsecase createGetPreviewUsecase(
    WaNotificationRepository repository,
  ) {
    return GetWaNotificationPreviewUsecase(repository);
  }

  static SendWaNotificationUsecase createSendNotificationUsecase(
    WaNotificationRepository repository,
  ) {
    return SendWaNotificationUsecase(repository);
  }

  static WaNotificationCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getPreview = createGetPreviewUsecase(repository);
    final sendNotification = createSendNotificationUsecase(repository);

    return WaNotificationCubit(
      getPreviewUsecase: getPreview,
      sendNotificationUsecase: sendNotification,
    );
  }
}
