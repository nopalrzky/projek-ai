import 'dart:async';
import 'dart:convert';
import 'package:flutter/services.dart';

import 'package:audioplayers/audioplayers.dart';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart' show VoidCallback, visibleForTesting;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

@pragma('vm:entry-point')
Future<void> cashierFirebaseMessagingBackgroundHandler(
  RemoteMessage message,
) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
}

class NewOrderPayload {
  final String type;
  final String eventId;
  final int orderId;
  final String orderNumber;
  final int outletId;
  final String status;
  final String customerName;
  final String? deliveryType;
  final String? createdAt;

  const NewOrderPayload({
    required this.type,
    required this.eventId,
    required this.orderId,
    required this.orderNumber,
    required this.outletId,
    required this.status,
    required this.customerName,
    this.deliveryType,
    this.createdAt,
  });

  factory NewOrderPayload.fromMap(Map<dynamic, dynamic> map) {
    return NewOrderPayload(
      type: _string(map['type']) ?? 'cashier_new_order',
      eventId:
          _string(map['eventId'] ?? map['event_id']) ??
          'order-${_int(map['orderId'] ?? map['order_id'])}',
      orderId: _int(map['orderId'] ?? map['order_id']),
      orderNumber:
          _string(map['orderNumber'] ?? map['order_number']) ?? 'Pesanan baru',
      outletId: _int(map['outletId'] ?? map['outlet_id']),
      status: _string(map['status']) ?? 'requested',
      customerName:
          _string(map['customerName'] ?? map['customer_name']) ?? 'Pelanggan',
      deliveryType: _string(map['deliveryType'] ?? map['delivery_type']),
      createdAt: _string(map['createdAt'] ?? map['created_at']),
    );
  }

  Map<String, dynamic> toJson() => {
    'type': type,
    'eventId': eventId,
    'orderId': orderId.toString(),
    'orderNumber': orderNumber,
    'outletId': outletId.toString(),
    'status': status,
    'customerName': customerName,
    'deliveryType': deliveryType,
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

class NotificationService {
  NotificationService._();

  static final NotificationService instance = NotificationService._();

  static const _pusherAppKey = String.fromEnvironment('PUSHER_APP_KEY');
  static const _pusherCluster = String.fromEnvironment(
    'PUSHER_CLUSTER',
    defaultValue: 'mt1',
  );
  static const _broadcastingAuthUrl = String.fromEnvironment(
    'BROADCASTING_AUTH_URL',
  );
  static const _deduplicationWindow = Duration(seconds: 60);
  static const _deviceIdKey = 'cashier_notification_device_id';

  final _localNotifications = FlutterLocalNotificationsPlugin();
  final _audioPlayer = AudioPlayer();
  final _newOrderController = StreamController<NewOrderPayload>.broadcast();
  final _tapController = StreamController<NewOrderPayload>.broadcast();
  final _badgeController = StreamController<int>.broadcast();
  final _shownOrderIds = <int, DateTime>{};

  Dio? _dio;
  PusherChannelsFlutter? _pusher;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;
  StreamSubscription<String>? _tokenRefreshSubscription;
  VoidCallback? _onReconnectCallback;
  int? _subscribedOutletId;
  int _badgeCount = 0;
  bool _initialized = false;
  bool _hasConnectedOnce = false;

  Stream<NewOrderPayload> get onNewOrder => _newOrderController.stream;
  Stream<NewOrderPayload> get onNotificationTap => _tapController.stream;
  Stream<int> get onBadgeCountChanged => _badgeController.stream;
  int get badgeCount => _badgeCount;

  Future<void> initialize({
    required Dio dio,
    required ApiEndpoints endpoints,
  }) async {
    _dio = dio;

    if (_initialized) return;
    _initialized = true;

    await _initializeLocalNotifications();
    await _initializeFirebaseMessaging();
  }

  void setOnReconnectCallback(VoidCallback callback) {
    _onReconnectCallback = callback;
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

  Future<String?> getFcmToken() async {
    try {
      return await FirebaseMessaging.instance.getToken();
    } catch (_) {
      return null;
    }
  }

  Future<String> getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString(_deviceIdKey);
    if (existing != null && existing.isNotEmpty) return existing;

    const uuid = Uuid();
    final deviceId = uuid.v4();
    await prefs.setString(_deviceIdKey, deviceId);
    return deviceId;
  }

  void registerTokenRefresh(void Function(String token) onToken) {
    _tokenRefreshSubscription?.cancel();
    try {
      _tokenRefreshSubscription = FirebaseMessaging.instance.onTokenRefresh
          .listen(onToken);
    } catch (_) {}
  }

  Future<void> connectPusher({required int outletId}) async {
    final dio = _dio;
    if (dio == null || _pusherAppKey.isEmpty) return;
    if (_pusher != null && _subscribedOutletId == outletId) return;

    await disconnectPusher();

    final pusher = PusherChannelsFlutter.getInstance();
    final authEndpoint = _resolveBroadcastingAuthUrl(dio);

    await pusher.init(
      apiKey: _pusherAppKey,
      cluster: _pusherCluster,
      authEndpoint: authEndpoint,
      onAuthorizer: (channelName, socketId, options) async {
        final response = await dio.post(
          authEndpoint,
          data: {'socket_id': socketId, 'channel_name': channelName},
        );

        return response.data;
      },
      onConnectionStateChange: (currentState, previousState) {
        if (currentState == 'CONNECTED') {
          if (_hasConnectedOnce && previousState != 'CONNECTED') {
            _onReconnectCallback?.call();
          }
          _hasConnectedOnce = true;
        }
      },
      onError: (message, code, error) {},
      onEvent: (event) {
        if (event.eventName == 'cashier.new-order.created' ||
            event.eventName == '.cashier.new-order.created') {
          _handlePusherEvent(event.data);
        }
      },
      onSubscriptionSucceeded: (channelName, data) {},
    );

    _pusher = pusher;
    await pusher.connect();
    await pusher.subscribe(channelName: 'private-outlet.$outletId');
    _subscribedOutletId = outletId;
  }

  Future<void> disconnectPusher() async {
    final outletId = _subscribedOutletId;
    final pusher = _pusher;

    if (pusher != null && outletId != null) {
      try {
        await pusher.unsubscribe(channelName: 'private-outlet.$outletId');
      } catch (_) {}
    }

    if (pusher != null) {
      try {
        await pusher.disconnect();
      } catch (_) {}
    }

    _pusher = null;
    _subscribedOutletId = null;
    _hasConnectedOnce = false;
  }

  Future<void> syncBadgeFromBackend(Future<int> Function() countLoader) async {
    try {
      _setBadgeCount(await countLoader());
    } catch (_) {}
  }

  void clearBadge() {
    _shownOrderIds.clear();
    _setBadgeCount(0);
  }

  @visibleForTesting
  NewOrderPayload? debugPayloadFromMap(Map<dynamic, dynamic> map) {
    return _payloadFromMap(map);
  }

  @visibleForTesting
  bool debugIsDuplicateOrder(int orderId) {
    return _isDuplicateOrder(orderId);
  }

  @visibleForTesting
  void debugMarkOrderShownAt(int orderId, DateTime shownAt) {
    _shownOrderIds[orderId] = shownAt;
  }

  Future<void> dispose() async {
    await _foregroundSubscription?.cancel();
    await _openedSubscription?.cancel();
    await _tokenRefreshSubscription?.cancel();
    await disconnectPusher();
    await _audioPlayer.dispose();
    await _newOrderController.close();
    await _tapController.close();
    await _badgeController.close();
  }

  Future<void> _initializeLocalNotifications() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(android: android);

    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: (response) {
        final payload = _payloadFromJson(response.payload);
        if (payload != null) {
          _tapController.add(payload);
        }
      },
    );
  }

  Future<void> _initializeFirebaseMessaging() async {
    try {
      FirebaseMessaging.onBackgroundMessage(
        cashierFirebaseMessagingBackgroundHandler,
      );
      await FirebaseMessaging.instance
          .setForegroundNotificationPresentationOptions(
            alert: true,
            badge: true,
            sound: true,
          );

      _foregroundSubscription = FirebaseMessaging.onMessage.listen((message) {
        final payload = _payloadFromMap(message.data);
        if (payload == null) return;
        _publishNewOrder(payload, showSystemNotification: true);
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

  String _resolveBroadcastingAuthUrl(Dio dio) {
    if (_broadcastingAuthUrl.isNotEmpty) return _broadcastingAuthUrl;

    final baseUri = Uri.parse(dio.options.baseUrl);
    final rootPath = baseUri.path.replaceFirst(RegExp(r'/api/?$'), '');

    return baseUri.replace(path: '$rootPath/broadcasting/auth').toString();
  }

  void _handlePusherEvent(dynamic rawData) {
    final data = _decodeEventData(rawData);
    final payload = _payloadFromMap(data);
    if (payload != null) {
      _publishNewOrder(payload);
    }
  }

  void _publishNewOrder(
    NewOrderPayload payload, {
    bool showSystemNotification = false,
  }) {
    if (payload.orderId <= 0 || _isDuplicateOrder(payload.orderId)) {
      return;
    }

    _markOrderShown(payload.orderId);
    _setBadgeCount(_badgeCount + 1);
    _newOrderController.add(payload);
    _playNotificationSound();

    try {
      HapticFeedback.mediumImpact();
    } catch (_) {}

    if (showSystemNotification) {
      _showLocalNotification(payload);
    }
  }

  bool _isDuplicateOrder(int orderId) {
    final shownAt = _shownOrderIds[orderId];
    if (shownAt == null) return false;

    return DateTime.now().difference(shownAt) < _deduplicationWindow;
  }

  void _markOrderShown(int orderId) {
    final now = DateTime.now();
    _shownOrderIds[orderId] = now;

    final cutoff = now.subtract(_deduplicationWindow * 2);
    _shownOrderIds.removeWhere((_, shownAt) => shownAt.isBefore(cutoff));
  }

  Future<void> _playNotificationSound() async {
    try {
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (_) {}
  }

  Future<void> _showLocalNotification(NewOrderPayload payload) async {
    const android = AndroidNotificationDetails(
      'cashier_new_orders',
      'Pesanan baru cashier',
      channelDescription: 'Notifikasi pesanan baru untuk cashier',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
    );

    await _localNotifications.show(
      payload.orderId,
      'Pesanan baru ${payload.orderNumber}',
      '${payload.customerName} menunggu diproses',
      const NotificationDetails(android: android),
      payload: jsonEncode(payload.toJson()),
    );
  }

  void _setBadgeCount(int count) {
    _badgeCount = count < 0 ? 0 : count;
    _badgeController.add(_badgeCount);
  }

  NewOrderPayload? _payloadFromMap(Map<dynamic, dynamic> map) {
    if (map.isEmpty) return null;
    final payload = NewOrderPayload.fromMap(map);
    if (payload.type != 'cashier_new_order') return null;
    return payload;
  }

  NewOrderPayload? _payloadFromJson(String? value) {
    if (value == null || value.isEmpty) return null;
    try {
      final decoded = jsonDecode(value) as Map<String, dynamic>;
      return _payloadFromMap(decoded);
    } catch (_) {
      return null;
    }
  }

  Map<String, dynamic> _decodeEventData(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    if (data is String && data.isNotEmpty) {
      final decoded = jsonDecode(data);
      if (decoded is Map<String, dynamic>) return decoded;
      if (decoded is Map) return Map<String, dynamic>.from(decoded);
    }
    return const {};
  }
}
