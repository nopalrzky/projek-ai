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

  factory PrintCoinInfoModel.fromJson(Map<String, dynamic> json) {
    int readInt(List<String> keys) {
      for (final key in keys) {
        final value = json[key];
        if (value is num) {
          return value.toInt();
        }
      }

      return 0;
    }

    bool readBool(List<String> keys) {
      for (final key in keys) {
        final value = json[key];
        if (value is bool) {
          return value;
        }
      }

      return false;
    }

    String? readString(List<String> keys) {
      for (final key in keys) {
        final value = json[key];
        if (value is String) {
          return value;
        }
      }

      return null;
    }

    return PrintCoinInfoModel(
      coinPrice: readInt(['coinPrice', 'coin_price']),
      featureActive: readBool(['featureActive', 'feature_active']),
      hasEnoughCoin: readBool(['hasEnoughCoin', 'has_enough_coin']),
      coinSource: readString(['coinSource', 'coin_source']),
      outletCoinBalance: readInt(['outletCoinBalance', 'outlet_coin_balance']),
      ownerCoinBalance: readInt(['ownerCoinBalance', 'owner_coin_balance']),
    );
  }

  PrintCoinInfo toEntity() => PrintCoinInfo(
    coinPrice: coinPrice,
    featureActive: featureActive,
    hasEnoughCoin: hasEnoughCoin,
    coinSource: coinSource,
    outletCoinBalance: outletCoinBalance,
    ownerCoinBalance: ownerCoinBalance,
  );
}
