import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/services.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
          const MethodChannel('xyz.luan/audioplayers.global'),
          (MethodCall methodCall) async {
            return 1;
          },
        );
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
          const MethodChannel('xyz.luan/audioplayers'),
          (MethodCall methodCall) async {
            return 1;
          },
        );
  });
  group('NewOrderPayload', () {
    test('parses broadcast style numeric ids', () {
      final payload = NewOrderPayload.fromMap({
        'type': 'cashier_new_order',
        'eventId': 'event-1',
        'orderId': 42,
        'orderNumber': 'ORD-42',
        'outletId': 7,
        'status': 'requested',
        'customerName': 'Budi',
        'deliveryType': 'pickup',
        'createdAt': '2026-06-12T10:00:00+07:00',
      });

      expect(payload.orderId, 42);
      expect(payload.outletId, 7);
      expect(payload.orderNumber, 'ORD-42');
      expect(payload.deliveryType, 'pickup');
    });

    test('parses FCM style string ids', () {
      final payload = NewOrderPayload.fromMap({
        'type': 'cashier_new_order',
        'eventId': 'event-2',
        'orderId': '43',
        'orderNumber': 'ORD-43',
        'outletId': '8',
        'status': 'pending_dropoff',
        'customerName': 'Siti',
      });

      expect(payload.orderId, 43);
      expect(payload.outletId, 8);
      expect(payload.status, 'pending_dropoff');
    });
  });

  group('NotificationService deduplication', () {
    test('treats same order id as duplicate within deduplication window', () {
      final service = NotificationService.instance;
      service.clearBadge();

      expect(service.debugIsDuplicateOrder(100), isFalse);

      service.debugMarkOrderShownAt(100, DateTime.now());

      expect(service.debugIsDuplicateOrder(100), isTrue);
    });

    test('allows same order id after deduplication window', () {
      final service = NotificationService.instance;
      service.clearBadge();

      service.debugMarkOrderShownAt(
        101,
        DateTime.now().subtract(const Duration(seconds: 61)),
      );

      expect(service.debugIsDuplicateOrder(101), isFalse);
    });
  });
}
