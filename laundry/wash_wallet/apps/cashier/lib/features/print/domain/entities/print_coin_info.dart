import 'package:equatable/equatable.dart';

class PrintCoinInfo extends Equatable {
  final int coinPrice;
  final bool featureActive;
  final bool hasEnoughCoin;
  final String? coinSource;
  final int outletCoinBalance;
  final int ownerCoinBalance;

  const PrintCoinInfo({
    required this.coinPrice,
    required this.featureActive,
    required this.hasEnoughCoin,
    this.coinSource,
    required this.outletCoinBalance,
    required this.ownerCoinBalance,
  });

  bool get canPrint => featureActive && hasEnoughCoin;

  String get coinSourceLabel {
    if (coinSource == 'outlet') return 'Outlet';
    if (coinSource == 'owner') return 'Owner';
    return '-';
  }

  int get activeCoinBalance {
    if (coinSource == 'outlet') return outletCoinBalance;
    if (coinSource == 'owner') return ownerCoinBalance;
    return 0;
  }

  @override
  List<Object?> get props => [
        coinPrice,
        featureActive,
        hasEnoughCoin,
        coinSource,
        outletCoinBalance,
        ownerCoinBalance,
      ];
}
