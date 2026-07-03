import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_wa_notification_preview_usecase.dart';
import '../../domain/usecases/send_wa_notification_usecase.dart';
import 'wa_notification_state.dart';

class WaNotificationCubit extends Cubit<WaNotificationState> {
  final GetWaNotificationPreviewUsecase _getPreviewUsecase;
  final SendWaNotificationUsecase _sendNotificationUsecase;

  WaNotificationCubit({
    required GetWaNotificationPreviewUsecase getPreviewUsecase,
    required SendWaNotificationUsecase sendNotificationUsecase,
  }) : _getPreviewUsecase = getPreviewUsecase,
       _sendNotificationUsecase = sendNotificationUsecase,
       super(const WaNotificationInitial());

  Future<void> getPreview(int orderId) async {
    emit(const WaNotificationPreviewLoading());

    final result = await _getPreviewUsecase(orderId);

    result.when(
      success: (preview) => emit(WaNotificationPreviewLoaded(preview)),
      failure: (failure) => emit(WaNotificationError(failure)),
    );
  }

  Future<void> sendNotification(
    int orderId,
    WaNotificationPreview preview, {
    String? clientRequestId,
  }) async {
    emit(WaNotificationSending(preview));

    final result = await _sendNotificationUsecase.execute(
      SendWaNotificationParams(
        orderId: orderId,
        clientRequestId: clientRequestId,
      ),
    );

    result.when(
      success: (data) {
        final nestedData = data['data'] as Map<String, dynamic>;
        emit(
          WaNotificationSent(
            message: data['message'] as String,
            coinDeducted: nestedData['coinDeducted'] as int,
            coinSource: nestedData['coinSource'] as String,
            remainingCoin: nestedData['remainingCoin'] as int,
          ),
        );
      },
      failure: (failure) =>
          emit(WaNotificationError(failure, preview: preview)),
    );
  }

  void reset() {
    emit(const WaNotificationInitial());
  }
}
