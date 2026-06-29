import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/print_coin_info.dart';

part 'print_coin_info_model.freezed.dart';
part 'print_coin_info_model.g.dart';

@freezed
class PrintCoinInfoModel with _$PrintCoinInfoModel {
  const factory PrintCoinInfoModel({
    required int coinPrice,
    required bool featureActive,
    required bool hasEnoughCoin,
    String? coinSource,
    required int outletCoinBalance,
    required int ownerCoinBalance,
  }) = _PrintCoinInfoModel;

  const PrintCoinInfoModel._();

  factory PrintCoinInfoModel.fromJson(Map<String, dynamic> json) =>
      _$PrintCoinInfoModelFromJson(json);

  PrintCoinInfo toEntity() => PrintCoinInfo(
    coinPrice: coinPrice,
    featureActive: featureActive,
    hasEnoughCoin: hasEnoughCoin,
    coinSource: coinSource,
    outletCoinBalance: outletCoinBalance,
    ownerCoinBalance: ownerCoinBalance,
  );
}
