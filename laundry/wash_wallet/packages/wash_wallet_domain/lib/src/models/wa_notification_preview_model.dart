import '../../wash_wallet_domain.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'wa_notification_preview_model.freezed.dart';
part 'wa_notification_preview_model.g.dart';

@freezed
class WaNotificationPreviewModel with _$WaNotificationPreviewModel {
  const factory WaNotificationPreviewModel({
    required int orderId,
    required String customerName,
    String? customerPhone,
    required bool hasPhone,
    required String messagePreview,
    required int coinPrice,
    required bool hasEnoughCoin,
    String? coinSource,
    required int outletCoinBalance,
    required int ownerCoinBalance,
  }) = _WaNotificationPreviewModel;

  const WaNotificationPreviewModel._();

  factory WaNotificationPreviewModel.fromJson(Map<String, dynamic> json) =>
      _$WaNotificationPreviewModelFromJson(json);

  WaNotificationPreview toEntity() => WaNotificationPreview(
    orderId: orderId,
    customerName: customerName,
    customerPhone: customerPhone,
    hasPhone: hasPhone,
    messagePreview: messagePreview,
    coinPrice: coinPrice,
    hasEnoughCoin: hasEnoughCoin,
    coinSource: coinSource,
    outletCoinBalance: outletCoinBalance,
    ownerCoinBalance: ownerCoinBalance,
  );
  factory WaNotificationPreviewModel.fromEntity(WaNotificationPreview entity) =>
      WaNotificationPreviewModel(
        orderId: entity.orderId,
        customerName: entity.customerName,
        customerPhone: entity.customerPhone,
        hasPhone: entity.hasPhone,
        messagePreview: entity.messagePreview,
        coinPrice: entity.coinPrice,
        hasEnoughCoin: entity.hasEnoughCoin,
        coinSource: entity.coinSource,
        outletCoinBalance: entity.outletCoinBalance,
        ownerCoinBalance: entity.ownerCoinBalance,
      );
}
