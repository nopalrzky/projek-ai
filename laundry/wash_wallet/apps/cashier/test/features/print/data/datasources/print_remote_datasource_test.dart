import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_cashier/features/print/data/datasources/print_remote_datasource.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

void main() {
  group('PrintRemoteDatasourceImpl.parsePrintCoinInfo', () {
    test('parses camelCase payload', () {
      final model = PrintRemoteDatasourceImpl.parsePrintCoinInfo({
        'data': {
          'coinDeducted': 1,
          'coinSource': 'outlet',
          'remainingCoin': 99,
        },
      }, 200);

      expect(model.coinPrice, 1);
      expect(model.coinSource, 'outlet');
      expect(model.outletCoinBalance, 99);
      expect(model.ownerCoinBalance, 0);
    });

    test('parses snake_case payload', () {
      final model = PrintRemoteDatasourceImpl.parsePrintCoinInfo({
        'data': {
          'coin_deducted': 2,
          'coin_source': 'owner',
          'remaining_coin': 88,
        },
      }, 200);

      expect(model.coinPrice, 2);
      expect(model.coinSource, 'owner');
      expect(model.outletCoinBalance, 0);
      expect(model.ownerCoinBalance, 88);
    });

    test('throws clear error when payload is missing required fields', () {
      expect(
        () => PrintRemoteDatasourceImpl.parsePrintCoinInfo({
          'data': {'coinSource': 'owner'},
        }, 200),
        throwsA(
          isA<ApiException>().having(
            (e) => e.message,
            'message',
            contains('coin_deducted / coinDeducted'),
          ),
        ),
      );
    });
  });

  group('PrintRemoteDatasourceImpl.validateResponse', () {
    test('returns body for successful response', () {
      final response = Response(
        requestOptions: RequestOptions(path: '/orders/1/print/label'),
        statusCode: 200,
        data: {
          'success': true,
          'message': 'OK',
          'data': {'coinDeducted': 1},
        },
      );

      final body = PrintRemoteDatasourceImpl.validateResponse(response);

      expect(body['success'], isTrue);
    });

    test('throws backend message when success is false', () {
      final response = Response(
        requestOptions: RequestOptions(path: '/orders/1/print/label'),
        statusCode: 422,
        data: {'success': false, 'message': 'Saldo coin tidak mencukupi.'},
      );

      expect(
        () => PrintRemoteDatasourceImpl.validateResponse(response),
        throwsA(
          isA<ApiException>().having(
            (e) => e.message,
            'message',
            'Saldo coin tidak mencukupi.',
          ),
        ),
      );
    });
  });
}
