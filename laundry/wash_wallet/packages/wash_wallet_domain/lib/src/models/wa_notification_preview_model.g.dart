// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wa_notification_preview_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WaNotificationPreviewModelImpl _$$WaNotificationPreviewModelImplFromJson(
  Map<String, dynamic> json,
) => _$WaNotificationPreviewModelImpl(
  orderId: (json['orderId'] as num).toInt(),
  customerName: json['customerName'] as String,
  customerPhone: json['customerPhone'] as String?,
  hasPhone: json['hasPhone'] as bool,
  messagePreview: json['messagePreview'] as String,
  coinPrice: (json['coinPrice'] as num).toInt(),
  hasEnoughCoin: json['hasEnoughCoin'] as bool,
  coinSource: json['coinSource'] as String?,
  outletCoinBalance: (json['outletCoinBalance'] as num).toInt(),
  ownerCoinBalance: (json['ownerCoinBalance'] as num).toInt(),
);

Map<String, dynamic> _$$WaNotificationPreviewModelImplToJson(
  _$WaNotificationPreviewModelImpl instance,
) => <String, dynamic>{
  'orderId': instance.orderId,
  'customerName': instance.customerName,
  'customerPhone': instance.customerPhone,
  'hasPhone': instance.hasPhone,
  'messagePreview': instance.messagePreview,
  'coinPrice': instance.coinPrice,
  'hasEnoughCoin': instance.hasEnoughCoin,
  'coinSource': instance.coinSource,
  'outletCoinBalance': instance.outletCoinBalance,
  'ownerCoinBalance': instance.ownerCoinBalance,
};
