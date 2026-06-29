import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderFilterSection extends StatelessWidget {
  final String? selectedStatus;
  final String? selectedPaymentStatus;
  final ValueChanged<String?> onStatusChanged;
  final ValueChanged<String?> onPaymentStatusChanged;

  const OrderFilterSection({
    super.key,
    required this.selectedStatus,
    required this.selectedPaymentStatus,
    required this.onStatusChanged,
    required this.onPaymentStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(child: _buildStatusFilter()),
          SizedBox(width: context.space.sm),
          Expanded(child: _buildPaymentStatusFilter()),
        ],
      ),
    );
  }

  Widget _buildStatusFilter() {
    final items = [
      const AppDropdownItem(value: 'all', label: 'Semua'),
      const AppDropdownItem(value: 'requested', label: 'Diajukan'),
      const AppDropdownItem(value: 'ready_to_process', label: 'Siap Dikerjakan'),
      const AppDropdownItem(value: 'in_progress', label: 'Diproses'),
      const AppDropdownItem(value: 'ready', label: 'Siap Ambil'),
      const AppDropdownItem(value: 'completed', label: 'Selesai'),
      const AppDropdownItem(value: 'cancelled', label: 'Dibatalkan'),
    ];

    final currentValue = selectedStatus == null
        ? items.first
        : items.firstWhere(
            (item) => item.value == selectedStatus,
            orElse: () => items.first,
          );

    return AppDropdown<AppDropdownItem<String>>(
      label: 'Status',
      hint: 'Pilih status',
      value: currentValue,
      items: items,
      itemLabel: (item) => item.label,
      prefixIcon: const Icon(Icons.filter_list_rounded),
      onChanged: (item) {
        onStatusChanged(item.value == 'all' ? null : item.value);
      },
    );
  }

  Widget _buildPaymentStatusFilter() {
    final items = [
      const AppDropdownItem(value: 'all', label: 'Semua'),
      const AppDropdownItem(value: 'not_yet_priced', label: 'Belum Diharga'),
      const AppDropdownItem(value: 'unpaid', label: 'Belum Bayar'),
      const AppDropdownItem(value: 'partial', label: 'DP'),
      const AppDropdownItem(value: 'paid', label: 'Lunas'),
      const AppDropdownItem(
        value: 'paid_by_package',
        label: 'Ditanggung Paket',
      ),
      const AppDropdownItem(value: 'cod', label: 'COD'),
    ];

    final currentValue = selectedPaymentStatus == null
        ? items.first
        : items.firstWhere(
            (item) => item.value == selectedPaymentStatus,
            orElse: () => items.first,
          );

    return AppDropdown<AppDropdownItem<String>>(
      label: 'Pembayaran',
      hint: 'Pilih status pembayaran',
      value: currentValue,
      items: items,
      itemLabel: (item) => item.label,
      prefixIcon: const Icon(Icons.payment_rounded),
      onChanged: (item) {
        onPaymentStatusChanged(item.value == 'all' ? null : item.value);
      },
    );
  }
}
