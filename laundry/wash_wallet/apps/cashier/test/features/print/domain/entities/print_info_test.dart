import 'package:flutter_test/flutter_test.dart';

import 'package:wash_wallet_cashier/features/print/domain/entities/print_coin_info.dart';
import 'package:wash_wallet_cashier/features/print/domain/entities/print_info.dart';

void main() {
  const coinInfo = PrintCoinInfo(
    coinPrice: 0,
    featureActive: true,
    hasEnoughCoin: true,
    outletCoinBalance: 0,
    ownerCoinBalance: 0,
  );

  PrintInfo buildPrintInfo(String paymentStatus) {
    return PrintInfo(
      orderId: 1,
      orderNumber: 'ORD-001',
      orderDate: DateTime(2026, 1, 1),
      paymentStatus: paymentStatus,
      subtotal: 10000,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 10000,
      paidAmount: 0,
      remainingAmount: 10000,
      customerName: 'Customer',
      customerPhone: '081234567890',
      outletName: 'Outlet',
      outletAddress: 'Alamat',
      orderItems: const [],
      cashierName: 'Kasir',
      receipt: coinInfo,
      label: coinInfo,
    );
  }

  group('PrintInfo paymentStatusLabel', () {
    test('maps paid_by_package to Ditanggung Paket', () {
      final info = buildPrintInfo('paid_by_package');

      expect(info.paymentStatusLabel, 'Ditanggung Paket');
    });

    test('maps unpaid to Belum Dibayar', () {
      final info = buildPrintInfo('unpaid');

      expect(info.paymentStatusLabel, 'Belum Dibayar');
    });
  });
}
