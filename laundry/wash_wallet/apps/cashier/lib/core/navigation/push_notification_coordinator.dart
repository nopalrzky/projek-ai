import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';

class PushNotificationCoordinator {
  PushNotificationCoordinator._();

  static final instance = PushNotificationCoordinator._();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  Map<String, dynamic>? _pendingPushPayload;
  int? _authenticatedOutletId;

  void initialize() {
    NotificationService.instance.onNotificationTap.listen((payload) {
      _pendingPushPayload = payload.toJson();
      _flushPendingPush();
    });
  }

  Future<void> checkInitialMessage() async {
  }

  void onAuthReady({required int outletId}) {
    _authenticatedOutletId = outletId;
    _flushPendingPush();
  }

  void onLogout() {
    _authenticatedOutletId = null;
  }



  void _flushPendingPush() {
    final payload = _pendingPushPayload;
    final outletId = _authenticatedOutletId;
    if (payload == null || outletId == null) return;

    final orderId = int.tryParse(payload['orderId']?.toString() ?? '');
    final payloadOutletId = int.tryParse(payload['outletId']?.toString() ?? '');
    if (orderId == null) return;

    _pendingPushPayload = null;
    _navigateToOrder(orderId, payloadOutletId ?? outletId);
  }

  void _navigateToOrder(int orderId, int outletId) {
    final context = navigatorKey.currentContext;
    if (context == null) return;

    context.push('/orders/$orderId');
  }
}
