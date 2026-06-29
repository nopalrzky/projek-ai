import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../customer_address/domain/entities/customer_address.dart';

class LocationPickerAddressItemWidget extends StatelessWidget {
  final CustomerAddress address;
  final IconData icon;
  final VoidCallback onTap;

  const LocationPickerAddressItemWidget({
    super.key,
    required this.address,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppListTile.compact(
      title: _title,
      subtitle: _subtitle,
      leading: Icon(icon, color: context.colors.primary),
      trailing: Icon(
        Icons.chevron_right_rounded,
        color: context.colors.textTertiary,
      ),
      onTap: onTap,
    );
  }

  String get _title {
    if (address.label.trim().isNotEmpty) return address.label;
    if (address.street.trim().isNotEmpty) return address.street;
    return 'Alamat';
  }

  String? get _subtitle {
    if (address.label.trim().isEmpty) return null;
    if (address.street.trim().isEmpty) return null;
    return address.street;
  }
}
