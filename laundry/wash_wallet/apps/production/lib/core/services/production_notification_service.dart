import 'dart:async';
import 'dart:convert';

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
Future<void> productionFirebaseMessagingBackgroundHandler(
  RemoteMessage message,
) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
}

class NewPickupPayload {
  final String type;
  final String eventId;
  final int orderId;
  final String orderNumber;
  final int outletId;
  final String outletName;
  final String customerName;
  final String? pickupAddress;
  final String? pickupSchedule;
  final String? formattedPickupSchedule;
  final String status;
  final String? createdAt;

  const NewPickupPayload({
    required this.type,
    required this.eventId,
    required this.orderId,
    required this.orderNumber,
    required this.outletId,
    required this.outletName,
    required this.customerName,
    this.pickupAddress,
    this.pickupSchedule,
    this.formattedPickupSchedule,
    required this.status,
    this.createdAt,
  });

  factory NewPickupPayload.fromMap(Map<dynamic, dynamic> map) {
    final orderId = _int(map['orderId'] ?? map['order_id']);

    return NewPickupPayload(
      type: _string(map['type']) ?? 'courier_new_pickup',
      eventId: _string(map['eventId'] ?? map['event_id']) ?? 'pickup-$orderId',
      orderId: orderId,
      orderNumber:
          _string(map['orderNumber'] ?? map['order_number']) ?? '#$orderId',
      outletId: _int(map['outletId'] ?? map['outlet_id']),
      outletName: _string(map['outletName'] ?? map['outlet_name']) ?? '',
      customerName:
          _string(map['customerName'] ?? map['customer_name']) ?? 'Pelanggan',
      pickupAddress: _string(map['pickupAddress'] ?? map['pickup_address']),
      pickupSchedule: _string(map['pickupSchedule'] ?? map['pickup_schedule']),
      formattedPickupSchedule: _string(
        map['formattedPickupSchedule'] ?? map['formatted_pickup_schedule'],
      ),
      status: _string(map['status']) ?? 'accepted',
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
    'customerName': customerName,
    'pickupAddress': pickupAddress,
    'pickupSchedule': pickupSchedule,
    'formattedPickupSchedule': formattedPickupSchedule,
    'status': status,
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

class ProductionNotificationService {
  ProductionNotificationService._();

  static final ProductionNotificationService instance =
      ProductionNotificationService._();

  static const _pusherAppKey = String.fromEnvironment('PUSHER_APP_KEY');
  static const _pusherCluster = String.fromEnvironment(
    'PUSHER_CLUSTER',
    defaultValue: 'mt1',
  );
  static const _broadcastingAuthUrl = String.fromEnvironment(
    'BROADCASTING_AUTH_URL',
  );
  static const _deduplicationWindow = Duration(seconds: 60);
  static const _deviceIdKey = 'production_notification_device_id';

  final _localNotifications = FlutterLocalNotificationsPlugin();
  final _audioPlayer = AudioPlayer();
  final _newPickupController = StreamController<NewPickupPayload>.broadcast();
  final _tapController = StreamController<NewPickupPayload>.broadcast();
  final _shownEventIds = <String, DateTime>{};
  final _subscribedOutletIds = <int>{};

  Dio? _dio;
  PusherChannelsFlutter? _pusher;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;
  StreamSubscription<String>? _tokenRefreshSubscription;
  VoidCallback? _onReconnectCallback;
  Set<int> _courierOutletIds = {};
  bool _initialized = false;
  bool _hasConnectedOnce = false;

  Stream<NewPickupPayload> get onNewPickup => _newPickupController.stream;
  Stream<NewPickupPayload> get onNotificationTap => _tapController.stream;

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

  void setCourierOutletIds(Set<int> outletIds) {
    _courierOutletIds = outletIds;
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

  Future<void> connectPusher({required List<int> outletIds}) async {
    final dio = _dio;
    final targetOutletIds = outletIds.toSet();
    if (dio == null || _pusherAppKey.isEmpty || targetOutletIds.isEmpty) {
      return;
    }
    if (_pusher != null && _setEquals(_subscribedOutletIds, targetOutletIds)) {
      return;
    }

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
        if (event.eventName == 'courier.new-pickup' ||
            event.eventName == '.courier.new-pickup') {
          _handlePusherEvent(event.data);
        }
      },
      onSubscriptionSucceeded: (channelName, data) {},
    );

    _pusher = pusher;
    await pusher.connect();

    for (final outletId in targetOutletIds) {
      await pusher.subscribe(channelName: 'private-outlet.$outletId');
      _subscribedOutletIds.add(outletId);
    }
  }

  Future<void> disconnectPusher() async {
    final pusher = _pusher;

    if (pusher != null) {
      for (final outletId in _subscribedOutletIds.toList()) {
        try {
          await pusher.unsubscribe(channelName: 'private-outlet.$outletId');
        } catch (_) {}
      }

      try {
        await pusher.disconnect();
      } catch (_) {}
    }

    _pusher = null;
    _subscribedOutletIds.clear();
    _hasConnectedOnce = false;
  }

  @visibleForTesting
  NewPickupPayload? debugPayloadFromMap(Map<dynamic, dynamic> map) {
    return _payloadFromMap(map);
  }

  Future<void> dispose() async {
    await _foregroundSubscription?.cancel();
    await _openedSubscription?.cancel();
    await _tokenRefreshSubscription?.cancel();
    await disconnectPusher();
    await _audioPlayer.dispose();
    await _newPickupController.close();
    await _tapController.close();
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
        if (payload == null) return;
        _publishNewPickup(payload, showSystemNotification: true);
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
    if (payload != null) _publishNewPickup(payload);
  }

  void _publishNewPickup(
    NewPickupPayload payload, {
    bool showSystemNotification = false,
  }) {
    if (payload.orderId <= 0 || _isDuplicate(payload.eventId)) return;

    _markShown(payload.eventId);
    _newPickupController.add(payload);
    _playNotificationSound();

    if (showSystemNotification) {
      _showLocalNotification(payload);
    }
  }

  bool _hasPermissionForOutlet(int outletId) {
    return _courierOutletIds.contains(outletId);
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

  Future<void> _playNotificationSound() async {
    try {
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (_) {}
  }

  Future<void> _showLocalNotification(NewPickupPayload payload) async {
    const android = AndroidNotificationDetails(
      'production_new_pickup',
      'Pesanan pickup baru',
      channelDescription: 'Notifikasi pesanan pickup baru untuk kurir',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
    );

    final schedule = payload.formattedPickupSchedule;
    final location =
        (payload.pickupAddress != null && payload.pickupAddress!.isNotEmpty)
        ? payload.pickupAddress!
        : payload.outletName;
    final bodySchedule = schedule == null || schedule.isEmpty
        ? 'jadwal pickup'
        : schedule;

    await _localNotifications.show(
      payload.orderId,
      'Pesanan Pickup Baru',
      'Pesanan pickup baru dari ${payload.customerName} untuk $bodySchedule di $location.',
      const NotificationDetails(android: android),
      payload: jsonEncode(payload.toJson()),
    );
  }

  NewPickupPayload? _payloadFromMap(Map<dynamic, dynamic> map) {
    if (map.isEmpty) return null;
    final payload = NewPickupPayload.fromMap(map);
    if (payload.type != 'courier_new_pickup') return null;
    if (payload.orderId <= 0) return null;
    if (!_hasPermissionForOutlet(payload.outletId)) return null;
    return payload;
  }

  NewPickupPayload? _payloadFromJson(String? value) {
    if (value == null || value.isEmpty) return null;
    try {
      final decoded = jsonDecode(value);
      if (decoded is Map<String, dynamic>) return _payloadFromMap(decoded);
      if (decoded is Map) return _payloadFromMap(decoded);
    } catch (_) {}
    return null;
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

  bool _setEquals(Set<int> first, Set<int> second) {
    return first.length == second.length && first.containsAll(second);
  }
}
