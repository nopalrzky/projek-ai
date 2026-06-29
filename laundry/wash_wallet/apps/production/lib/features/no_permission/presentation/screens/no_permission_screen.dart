import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../widgets/no_permission_actions.dart';
import '../widgets/no_permission_employee_info.dart';
import '../widgets/no_permission_illustration.dart';
import '../widgets/no_permission_message.dart';

class NoPermissionScreen extends StatelessWidget {
  final String permissionContext;

  const NoPermissionScreen({super.key, required this.permissionContext});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(context.space.xl),
          child: Column(
            children: [
              const Spacer(),
              NoPermissionIllustration(permissionContext: permissionContext),
              SizedBox(height: context.space.xxl),
              NoPermissionMessage(permissionContext: permissionContext),
              SizedBox(height: context.space.lg),
              const NoPermissionEmployeeInfo(),
              const Spacer(),
              NoPermissionActions(permissionContext: permissionContext),
            ],
          ),
        ),
      ),
    );
  }
}
