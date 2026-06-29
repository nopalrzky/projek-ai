import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_cashier/features/print/data/models/print_coin_info_model.dart';
import 'package:wash_wallet_cashier/features/print/data/models/print_info_model.dart';
import 'package:wash_wallet_cashier/features/print/data/models/print_order_item_model.dart';

void main() {
  group('PrintInfoModel.fromJson', () {
    test('parses camelCase payload with nullable address safely', () {
      final model = PrintInfoModel.fromJson({
        'order': {
          'id': 30,
          'orderNumber': 'ORD202605220016842',
          'orderDate': '2026-05-22T01:24:48.000000Z',
          'estimatedCompletion': null,
          'paymentStatus': 'paid',
          'subtotal': 241080.16,
          'discountAmount': 0,
          'taxAmount': 24108.02,
          'totalAmount': 265188.18,
          'paidAmount': 265188.18,
          'remainingAmount': 0,
        },
        'customer': {
          'name': 'Tod Mills',
          'phone': '678-740-0026',
        },
        'outlet': {
          'name': 'Kunde, Macejkovic and Veum Laundry',
          'address': null,
        },
        'orderItems': [
          {
            'laundryServiceName': 'Cuci Komplit',
            'quantity': 8.3,
            'unitName': 'Pieces',
            'unitPrice': 34155.83,
            'totalAmount': 144460.01,
          },
        ],
        'cashierName': 'Derek Greenholt',
        'printReceipt': {
          'coinPrice': 50,
          'featureActive': true,
          'hasEnoughCoin': true,
          'coinSource': 'owner',
          'outletCoinBalance': 0,
          'ownerCoinBalance': 49900,
        },
        'printLabel': {
          'coinPrice': 50,
          'featureActive': true,
          'hasEnoughCoin': true,
          'coinSource': 'owner',
          'outletCoinBalance': 0,
          'ownerCoinBalance': 49900,
        },
      });

      expect(model.orderId, 30);
      expect(model.orderNumber, 'ORD202605220016842');
      expect(model.orderDate, DateTime.parse('2026-05-22T01:24:48.000000Z'));
      expect(model.estimatedCompletion, isNull);
      expect(model.outletAddress, '-');
      expect(model.orderItems, hasLength(1));
      expect(model.receipt.coinSource, 'owner');
      expect(model.label.ownerCoinBalance, 49900);
    });

    test('supports legacy snake_case payloads', () {
      final model = PrintInfoModel.fromJson({
        'order': {
          'id': 12,
          'order_number': 'ORD-12',
          'order_date': '2026-05-20T10:00:00.000000Z',
          'estimated_completion': '2026-05-21T10:00:00.000000Z',
          'payment_status': 'unpaid',
          'subtotal': 1000,
          'discount_amount': 0,
          'tax_amount': 0,
          'total_amount': 1000,
          'paid_amount': 0,
          'remaining_amount': 1000,
        },
        'customer': {'name': 'Customer', 'phone': null},
        'outlet': {'name': 'Outlet', 'address': 'Alamat'},
        'order_items': [
          {
            'laundry_service_name': 'Cuci',
            'quantity': 1,
            'unit_name': 'Kg',
            'unit_price': 1000,
            'total_amount': 1000,
          },
        ],
        'cashier_name': 'Kasir',
        'print_receipt': {
          'coin_price': 25,
          'feature_active': false,
          'has_enough_coin': false,
          'coin_source': null,
          'outlet_coin_balance': 10,
          'owner_coin_balance': 20,
        },
        'print_label': {
          'coin_price': 25,
          'feature_active': false,
          'has_enough_coin': false,
          'coin_source': null,
          'outlet_coin_balance': 10,
          'owner_coin_balance': 20,
        },
      });

      expect(model.orderNumber, 'ORD-12');
      expect(model.customerPhone, '-');
      expect(model.outletAddress, 'Alamat');
      expect(model.receipt.featureActive, isFalse);
      expect(model.label.coinPrice, 25);
    });
  });

  group('PrintCoinInfoModel.fromJson', () {
    test('parses camelCase and snake_case keys', () {
      final camelCase = PrintCoinInfoModel.fromJson({
        'coinPrice': 50,
        'featureActive': true,
        'hasEnoughCoin': true,
        'coinSource': 'owner',
        'outletCoinBalance': 0,
        'ownerCoinBalance': 99,
      });

      final snakeCase = PrintCoinInfoModel.fromJson({
        'coin_price': 25,
        'feature_active': false,
        'has_enough_coin': false,
        'coin_source': null,
        'outlet_coin_balance': 7,
        'owner_coin_balance': 8,
      });

      expect(camelCase.coinPrice, 50);
      expect(camelCase.coinSource, 'owner');
      expect(snakeCase.coinPrice, 25);
      expect(snakeCase.coinSource, isNull);
      expect(snakeCase.hasEnoughCoin, isFalse);
    });
  });

  group('PrintOrderItemModel.fromJson', () {
    test('parses camelCase and snake_case keys', () {
      final camelCase = PrintOrderItemModel.fromJson({
        'laundryServiceName': 'Cuci Komplit',
        'quantity': 8.3,
        'unitName': 'Pieces',
        'unitPrice': 34155.83,
        'totalAmount': 144460.01,
      });

      final snakeCase = PrintOrderItemModel.fromJson({
        'laundry_service_name': 'Cuci Basah',
        'quantity': 4.97,
        'unit_name': 'Pieces',
        'unit_price': 69660.45,
        'total_amount': 94867.36,
      });

      expect(camelCase.laundryServiceName, 'Cuci Komplit');
      expect(camelCase.quantity, 8.3);
      expect(snakeCase.laundryServiceName, 'Cuci Basah');
      expect(snakeCase.totalAmount, 94867.36);
    });
  });
}