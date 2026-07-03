import 'package:flutter/material.dart';

import '../../../no_permission/presentation/screens/cashier_no_permission_screen.dart';

class AccessDeniedScreen extends StatelessWidget {
  const AccessDeniedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const CashierNoPermissionScreen(
      featureContext: 'aplikasi kasir',
      isAppLevel: true,
    );
  }
}
