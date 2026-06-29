import 'dart:async';

import 'package:go_router/go_router.dart';

import '../services/customer_notification_service.dart';

class CustomerPushNotificationCoordinator {
  CustomerPushNotificationCoordinator._();

  static final CustomerPushNotificationCoordinator instance =
      CustomerPushNotificationCoordinator._();

  GoRouter? _router;
  StreamSubscription<OrderAcceptedPayload>? _subscription;
  OrderAcceptedPayload? _pendingPayload;
  bool _isAuthenticated = false;

  void initialize() {
    _subscription ??= CustomerNotificationService.instance.onNotificationTap
        .listen(_handleTap);
  }

  void attachRouter(GoRouter router) {
    _router = router;
    _flushPending();
  }

  void onAuthReady() {
    _isAuthenticated = true;
    _flushPending();
  }

  void onLogout() {
    _isAuthenticated = false;
  }

  void dispose() {
    _subscription?.cancel();
    _subscription = null;
  }

  void _handleTap(OrderAcceptedPayload payload) {
    _pendingPayload = payload;
    _flushPending();
  }

  void _flushPending() {
    final router = _router;
    final payload = _pendingPayload;
    if (!_isAuthenticated || router == null || payload == null) return;

    _pendingPayload = null;
    router.go('/orders/${payload.orderId}');
  }
}
