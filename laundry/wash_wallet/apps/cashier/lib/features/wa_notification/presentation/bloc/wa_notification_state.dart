import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class WaNotificationState extends Equatable {
  const WaNotificationState();

  @override
  List<Object?> get props => [];
}

class WaNotificationInitial extends WaNotificationState {
  const WaNotificationInitial();
}

class WaNotificationPreviewLoading extends WaNotificationState {
  const WaNotificationPreviewLoading();
}

class WaNotificationPreviewLoaded extends WaNotificationState {
  final WaNotificationPreview preview;

  const WaNotificationPreviewLoaded(this.preview);

  @override
  List<Object?> get props => [preview];
}

class WaNotificationSending extends WaNotificationState {
  final WaNotificationPreview preview;

  const WaNotificationSending(this.preview);

  @override
  List<Object?> get props => [preview];
}

class WaNotificationSent extends WaNotificationState {
  final String message;
  final int coinDeducted;
  final String coinSource;
  final int remainingCoin;

  const WaNotificationSent({
    required this.message,
    required this.coinDeducted,
    required this.coinSource,
    required this.remainingCoin,
  });

  @override
  List<Object?> get props => [message, coinDeducted, coinSource, remainingCoin];
}

class WaNotificationError extends WaNotificationState {
  final Failure failure;
  final WaNotificationPreview? preview;

  const WaNotificationError(this.failure, {this.preview});

  @override
  List<Object?> get props => [failure, preview];
}
