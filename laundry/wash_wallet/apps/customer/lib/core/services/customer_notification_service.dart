import 'dart:async';
import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart' show visibleForTesting;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

@pragma('vm:entry-point')
Future<void> customerFirebaseMessagingBackgroundHandler(
  RemoteMessage message,
) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
}

class OrderAcceptedPayload {
  final String type;
  final String eventId;
  final int orderId;
  final String orderNumber;
  final int outletId;
  final String outletName;
  final String status;
  final String? pickupSchedule;
  final String? formattedPickupSchedule;
  final String? createdAt;

  const OrderAcceptedPayload({
    required this.type,
    required this.eventId,
    required this.orderId,
    required this.orderNumber,
    required this.outletId,
    required this.outletName,
    required this.status,
    this.pickupSchedule,
    this.formattedPickupSchedule,
    this.createdAt,
  });

  factory OrderAcceptedPayload.fromMap(Map<dynamic, dynamic> map) {
    final orderId = _int(map['orderId'] ?? map['order_id']);

    return OrderAcceptedPayload(
      type: _string(map['type']) ?? 'customer_order_accepted',
      eventId: _string(map['eventId'] ?? map['event_id']) ?? 'accept-$orderId',
      orderId: orderId,
      orderNumber:
          _string(map['orderNumber'] ?? map['order_number']) ?? '#$orderId',
      outletId: _int(map['outletId'] ?? map['outlet_id']),
      outletName: _string(map['outletName'] ?? map['outlet_name']) ?? '',
      status: _string(map['status']) ?? 'accepted',
      pickupSchedule: _string(map['pickupSchedule'] ?? map['pickup_schedule']),
      formattedPickupSchedule: _string(
        map['formattedPickupSchedule'] ?? map['formatted_pickup_schedule'],
      ),
      createdAt: _string(map['createdAt'] ?? map['created_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'type': type,
    'eventId': eventId,
    'orderId': orderId.toString(),
    'orderNumber': orderNumber,
    'outletId': outletId.toString(),
    'outletName': outletName,
    'status': status,
    'pickupSchedule': pickupSchedule,
    'formattedPickupSchedule': formattedPickupSchedule,
    'createdAt': createdAt,
  };

  static int _int(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  static String? _string(dynamic value) => value?.toString();
}

class CustomerNotificationService {
  CustomerNotificationService._();

  static final CustomerNotificationService instance =
      CustomerNotificationService._();

  static const _deduplicationWindow = Duration(seconds: 60);

  final _localNotifications = FlutterLocalNotificationsPlugin();
  final _tapController = StreamController<OrderAcceptedPayload>.broadcast();
  final _acceptedController =
      StreamController<OrderAcceptedPayload>.broadcast();
  final _shownEventIds = <String, DateTime>{};

  Stream<OrderAcceptedPayload> get onNotificationTap => _tapController.stream;
  Stream<OrderAcceptedPayload> get onOrderAccepted =>
      _acceptedController.stream;

  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    await _initializeLocalNotifications();
    await _initializeFirebaseMessaging();
  }

  Future<void> requestPermission() async {
    try {
      await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
    } catch (_) {}
  }

  Future<void> dispose() async {
    await _foregroundSubscription?.cancel();
    await _openedSubscription?.cancel();
    await _tapController.close();
    await _acceptedController.close();
  }

  @visibleForTesting
  OrderAcceptedPayload? debugPayloadFromMap(Map<dynamic, dynamic> map) {
    return _payloadFromMap(map);
  }

  Future<void> _initializeLocalNotifications() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(android: android);

    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: (response) {
        final payload = _payloadFromJson(response.payload);
        if (payload != null) _tapController.add(payload);
      },
    );
  }

  Future<void> _initializeFirebaseMessaging() async {
    try {
      await FirebaseMessaging.instance
          .setForegroundNotificationPresentationOptions(
            alert: true,
            badge: true,
            sound: true,
          );

      _foregroundSubscription = FirebaseMessaging.onMessage.listen((message) {
        final payload = _payloadFromMap(message.data);
        if (payload == null || _isDuplicate(payload.eventId)) return;
        _markShown(payload.eventId);
        _acceptedController.add(payload);
        _showLocalNotification(payload);
      });

      _openedSubscription = FirebaseMessaging.onMessageOpenedApp.listen((
        message,
      ) {
        final payload = _payloadFromMap(message.data);
        if (payload != null) _tapController.add(payload);
      });

      final initialMessage = await FirebaseMessaging.instance
          .getInitialMessage();
      final initialPayload = initialMessage == null
          ? null
          : _payloadFromMap(initialMessage.data);
      if (initialPayload != null) {
        scheduleMicrotask(() => _tapController.add(initialPayload));
      }
    } catch (_) {}
  }

  Future<void> _showLocalNotification(OrderAcceptedPayload payload) async {
    const android = AndroidNotificationDetails(
      'customer_order_accepted',
      'Pesanan diterima',
      channelDescription: 'Notifikasi pesanan customer yang sudah diterima',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
    );

    final scheduleText = payload.formattedPickupSchedule;
    final body = scheduleText == null || scheduleText.isEmpty
        ? 'Pesanan Anda sudah diterima. Kurir akan segera menjemput sesuai jadwal pickup.'
        : 'Pesanan Anda sudah diterima. Kurir akan menjemput pada $scheduleText.';

    await _localNotifications.show(
      payload.orderId,
      'Pesanan Anda Diterima',
      body,
      const NotificationDetails(android: android),
      payload: jsonEncode(payload.toJson()),
    );
  }

  bool _isDuplicate(String eventId) {
    final shownAt = _shownEventIds[eventId];
    if (shownAt == null) return false;

    return DateTime.now().difference(shownAt) < _deduplicationWindow;
  }

  void _markShown(String eventId) {
    final now = DateTime.now();
    _shownEventIds[eventId] = now;

    final cutoff = now.subtract(_deduplicationWindow * 2);
    _shownEventIds.removeWhere((_, shownAt) => shownAt.isBefore(cutoff));
  }

  OrderAcceptedPayload? _payloadFromMap(Map<dynamic, dynamic> map) {
    if (map.isEmpty) return null;
    final payload = OrderAcceptedPayload.fromMap(map);
    if (payload.type != 'customer_order_accepted') return null;
    if (payload.orderId <= 0) return null;
    return payload;
  }

  OrderAcceptedPayload? _payloadFromJson(String? value) {
    if (value == null || value.isEmpty) return null;
    try {
      final decoded = jsonDecode(value);
      if (decoded is Map<String, dynamic>) return _payloadFromMap(decoded);
      if (decoded is Map) return _payloadFromMap(decoded);
    } catch (_) {}
    return null;
  }
}
