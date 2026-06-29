import 'dart:async';

import 'package:go_router/go_router.dart';

import '../services/production_notification_service.dart';

class ProductionPushNotificationCoordinator {
  ProductionPushNotificationCoordinator._();

  static final ProductionPushNotificationCoordinator instance =
      ProductionPushNotificationCoordinator._();

  GoRouter? _router;
  StreamSubscription<NewPickupPayload>? _subscription;
  NewPickupPayload? _pendingPayload;
  bool _isAuthenticated = false;

  void initialize() {
    _subscription ??= ProductionNotificationService.instance.onNotificationTap
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

  void _handleTap(NewPickupPayload payload) {
    _pendingPayload = payload;
    _flushPending();
  }

  void _flushPending() {
    final router = _router;
    final payload = _pendingPayload;
    if (!_isAuthenticated || router == null || payload == null) return;

    _pendingPayload = null;
    router.go('/pickup-schedule');
  }
}
