import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class NoPermissionIllustration extends StatelessWidget {
  final String permissionContext;

  const NoPermissionIllustration({super.key, required this.permissionContext});

  @override
  Widget build(BuildContext context) {
    final size = context.space.xxl + context.space.xxl;

    return Center(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: context.colors.errorSurface,
          borderRadius: BorderRadius.circular(context.radius.xl),
        ),
        child: Icon(
          Icons.lock_outline_rounded,
          color: context.colors.error,
          size: context.space.xxl,
        ),
      ),
    );
  }
}
