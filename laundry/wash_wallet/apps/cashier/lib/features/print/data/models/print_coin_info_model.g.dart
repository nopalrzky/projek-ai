// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_coin_info_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PrintCoinInfoModelImpl _$$PrintCoinInfoModelImplFromJson(
  Map<String, dynamic> json,
) => _$PrintCoinInfoModelImpl(
  coinPrice: (json['coinPrice'] as num).toInt(),
  featureActive: json['featureActive'] as bool,
  hasEnoughCoin: json['hasEnoughCoin'] as bool,
  coinSource: json['coinSource'] as String?,
  outletCoinBalance: (json['outletCoinBalance'] as num).toInt(),
  ownerCoinBalance: (json['ownerCoinBalance'] as num).toInt(),
);

Map<String, dynamic> _$$PrintCoinInfoModelImplToJson(
  _$PrintCoinInfoModelImpl instance,
) => <String, dynamic>{
  'coinPrice': instance.coinPrice,
  'featureActive': instance.featureActive,
  'hasEnoughCoin': instance.hasEnoughCoin,
  'coinSource': instance.coinSource,
  'outletCoinBalance': instance.outletCoinBalance,
  'ownerCoinBalance': instance.ownerCoinBalance,
};
