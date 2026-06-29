import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../print/presentation/widgets/print_modal.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../widgets/wa_notification_modal.dart';
import 'index_orders_screen.dart';

class OrderSuccessScreen extends StatelessWidget {
  final int outletId;
  final Order order;

  const OrderSuccessScreen({
    super.key,
    required this.outletId,
    required this.order,
  });

  void _handleBackToOrders(BuildContext context) {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => IndexOrdersScreen(outletId: outletId)),
      (route) => route.isFirst,
    );
  }

  String _customerNameOrFallback(Customer? customer) {
    if (customer == null) return '-';
    return customer.name.trim().isNotEmpty ? customer.name : '-';
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Pesanan Berhasil',
        onBackPressed: () => _handleBackToOrders(context),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(context.space.xl),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.check_circle, size: 80, color: Colors.green),
            ),
            SizedBox(height: context.space.lg),

            Text(
              'Pesanan Berhasil Dibuat!',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: context.space.sm),
            Text(
              'Pesanan Anda telah berhasil dibuat dan tersimpan',
              style: context.typography.bodyMedium.copyWith(
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: context.space.xl),

            Container(
              padding: EdgeInsets.all(context.space.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(context.radius.md),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Informasi Pesanan',
                    style: context.typography.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: context.space.md),

                  _buildInfoRow(
                    context,
                    'Nomor Pesanan',
                    order.orderNumber,
                    isBold: true,
                  ),
                  Divider(height: context.space.md * 2),

                  _buildInfoRow(
                    context,
                    'Pelanggan',
                    _customerNameOrFallback(order.customer),
                  ),
                  SizedBox(height: context.space.sm),

                  _buildInfoRow(
                    context,
                    'Tanggal',
                    order.formattedOrderDate ?? '-',
                  ),
                  SizedBox(height: context.space.sm),

                  if (order.formattedEstimatedCompletion != null) ...[
                    _buildInfoRow(
                      context,
                      'Estimasi Selesai',
                      order.formattedEstimatedCompletion!,
                    ),
                    SizedBox(height: context.space.sm),
                  ],

                  _buildInfoRow(
                    context,
                    'Jumlah Item',
                    '${order.orderItemsCount} item',
                  ),
                  SizedBox(height: context.space.sm),

                  _buildInfoRow(context, 'Status', order.statusLabel ?? '-'),
                  Divider(height: context.space.md * 2),

                  _buildInfoRow(
                    context,
                    'Total',
                    order.formattedTotalAmount ?? '-',
                    isBold: true,
                    isTotal: true,
                  ),
                  SizedBox(height: context.space.sm),

                  _buildInfoRow(
                    context,
                    'Dibayar',
                    order.formattedPaidAmount ?? '-',
                  ),
                  SizedBox(height: context.space.sm),

                  if (order.remainingAmount > 0)
                    _buildInfoRow(
                      context,
                      'Sisa',
                      order.formattedRemainingAmount ?? '-',
                      valueColor: Colors.orange,
                    ),
                ],
              ),
            ),
            SizedBox(height: context.space.xl),

            Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => showPrintModal(context, orderId: order.id),
                    icon: const Icon(Icons.print),
                    label: const Text('Cetak Struk / Label'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: context.space.md),
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: context.space.sm),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () =>
                        showWaNotificationModal(context, orderId: order.id),
                    icon: const Icon(Icons.chat_rounded),
                    label: const Text('Kirim Notifikasi WhatsApp'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: context.space.md),
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: context.space.sm),

                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => _handleBackToOrders(context),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: context.space.md),
                    ),
                    child: const Text('Kembali ke Daftar Pesanan'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value, {
    bool isBold = false,
    bool isTotal = false,
    Color? valueColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: context.typography.bodyMedium.copyWith(
            color: Colors.grey[600],
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: context.typography.bodyMedium.copyWith(
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: valueColor,
            fontSize: isTotal ? 16 : null,
          ),
        ),
      ],
    );
  }
}
