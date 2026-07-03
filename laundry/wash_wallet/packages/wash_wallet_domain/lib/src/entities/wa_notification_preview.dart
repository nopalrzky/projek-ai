import 'package:equatable/equatable.dart';

class WaNotificationPreview extends Equatable {
  final int orderId;
  final String customerName;
  final String? customerPhone;
  final bool hasPhone;
  final String messagePreview;
  final int coinPrice;
  final bool hasEnoughCoin;
  final String? coinSource;
  final int outletCoinBalance;
  final int ownerCoinBalance;

  const WaNotificationPreview({
    required this.orderId,
    required this.customerName,
    this.customerPhone,
    required this.hasPhone,
    required this.messagePreview,
    required this.coinPrice,
    required this.hasEnoughCoin,
    this.coinSource,
    required this.outletCoinBalance,
    required this.ownerCoinBalance,
  });

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
    orderId,
    customerName,
    customerPhone,
    hasPhone,
    messagePreview,
    coinPrice,
    hasEnoughCoin,
    coinSource,
    outletCoinBalance,
    ownerCoinBalance,
  ];
}
