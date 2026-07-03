import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class MembershipContractFilterSection extends StatelessWidget {
  final String? selectedStatus;
  final Function(String?) onStatusChanged;

  const MembershipContractFilterSection({
    super.key,
    required this.selectedStatus,
    required this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      color: context.colors.surface,
      child: Row(children: [Expanded(child: _buildStatusFilter(context))]),
    );
  }

  Widget _buildStatusFilter(BuildContext context) {
    final items = [
      AppDropdownItem(value: 'all', label: 'Semua Status'),
      AppDropdownItem(value: 'active', label: 'Aktif'),
      AppDropdownItem(value: 'expired', label: 'Kedaluwarsa'),
    ];

    final currentValue = items.firstWhere(
      (item) => item.value == (selectedStatus ?? 'all'),
      orElse: () => items.first,
    );

    return AppDropdown<AppDropdownItem<String>>(
      label: 'Status',
      hint: 'Pilih status',
      value: currentValue,
      items: items,
      itemLabel: (item) => item.label,
      onChanged: (item) {
        onStatusChanged(item?.value == 'all' ? null : item?.value);
      },
    );
  }
}
