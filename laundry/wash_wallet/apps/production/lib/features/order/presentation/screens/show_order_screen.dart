import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../widgets/widgets.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../../../print/presentation/widgets/print_modal.dart';

class ShowOrderScreen extends StatefulWidget {
  final int orderId;

  const ShowOrderScreen({super.key, required this.orderId});

  @override
  State<ShowOrderScreen> createState() => _ShowOrderScreenState();
}

class _ShowOrderScreenState extends State<ShowOrderScreen> {
  @override
  void initState() {
    super.initState();
    final currentState = context.read<OrderCubit>().state;
    if (currentState is! OrderDetailLoaded ||
        (currentState.order.id != widget.orderId)) {
      _loadOrderDetail();
    }
  }

  void _loadOrderDetail() {
    context.read<OrderCubit>().getById(widget.orderId);
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final body = BlocListener<OrderCubit, OrderState>(
      listener: (context, state) {
        if (state is OrderCompleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Order berhasil diselesaikan'),
              backgroundColor: context.colors.success,
            ),
          );
          _loadOrderDetail();
        }
        if (state is OrderError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: context.colors.error,
            ),
          );
        }
      },
      child: BlocBuilder<OrderCubit, OrderState>(
        builder: (context, state) {
          if (state is OrderDetailLoading) {
            return const Center(
              child: AppLoadingIndicator(message: 'Memuat detail order...'),
            );
          }

          if (state is OrderDetailError) {
            return Center(
              child: AppErrorState(
                message: state.message,
                onRetry: _loadOrderDetail,
              ),
            );
          }

          if (state is OrderDetailLoaded) {
            return _buildOrderDetail(context, state.order);
          }

          return const SizedBox.shrink();
        },
      ),
    );

    final bottomBar = BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        if (state is OrderDetailLoaded) {
          final order = state.order;
          final status = order.status.toLowerCase();
          final isInProgress = status == 'in_progress';
          final canPrint = status == 'in_progress' || status == 'completed';

          if (isInProgress) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isCompact) _buildPrintButton(context, order),
                OrderCompleteButton(
                  order: order,
                  onComplete: () {
                    context.read<OrderCubit>().complete(order.id);
                  },
                ),
              ],
            );
          }

          if (canPrint && isCompact) {
            return _buildPrintButton(context, order);
          }
        }
        return const SizedBox.shrink();
      },
    );

    if (isCompact) {
      return AppLayoutWithDrawer(
        scrollable: false,
        header: AppHeader(
          title: 'Detail Order',
          subtitle: 'Informasi detail order produksi',
          onBackPressed: () => context.pop(),
        ),
        body: body,
        bottomBar: bottomBar,
      );
    }

    return Column(
      children: [
        PageContentHeader(
          title: 'Detail Order',
          subtitle: 'Order #${widget.orderId}',
          breadcrumbs: [
            BreadcrumbItem(
              label: 'Antrian Produksi',
              onTap: () => context.pop(),
            ),
            BreadcrumbItem(label: 'Order #${widget.orderId}'),
          ],
          actions: [
            BlocBuilder<OrderCubit, OrderState>(
              builder: (context, state) {
                if (state is OrderDetailLoaded) {
                  final order = state.order;
                  final status = order.status.toLowerCase();
                  final canPrint =
                      status == 'in_progress' || status == 'completed';

                  if (canPrint) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          showPrintModal(context, orderId: order.id);
                        },
                        icon: const Icon(Icons.print_outlined),
                        label: const Text('Cetak Struk'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: context.colors.primary,
                          foregroundColor: context.colors.onPrimary,
                        ),
                      ),
                    );
                  }
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
        Expanded(child: body),
        bottomBar,
      ],
    );
  }

  Widget _buildOrderDetail(BuildContext context, Order order) {
    final status = order.status.toLowerCase();
    final isPending = status == 'ready_to_process';
    final isInProgress = status == 'in_progress';

    return RefreshIndicator(
      onRefresh: () async {
        _loadOrderDetail();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildOrderInfoCard(context, order),
            SizedBox(height: context.space.md),

            _buildOrderItemsSection(context, order, isPending, isInProgress),
            SizedBox(height: context.space.md),

            _buildOrderSummary(context, order),
            SizedBox(height: context.space.md),

            if (order.notes != null && order.notes!.isNotEmpty)
              _buildNotesSection(context, order),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderInfoCard(BuildContext context, Order order) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.lg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Order Number',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textTertiary,
                      ),
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      order.orderNumber,
                      style: context.typography.headlineMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: context.colors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              OrderStatusBadge(status: order.status),
            ],
          ),
          SizedBox(height: context.space.md),
          const AppDivider(),
          SizedBox(height: context.space.md),

          _buildInfoRow(
            context,
            'Pelanggan',
            'Customer #${order.customerId}',
            Icons.person_outline,
          ),
          SizedBox(height: context.space.sm),

          _buildInfoRow(
            context,
            'Pegawai',
            'Employee #${order.employeeId}',
            Icons.badge_outlined,
          ),
          SizedBox(height: context.space.sm),

          _buildInfoRow(
            context,
            'Tanggal Order',
            DateFormat(
              'dd MMM yyyy, HH:mm',
              'id_ID',
            ).format(order.orderDate ?? DateTime.now()),
            Icons.calendar_today_outlined,
          ),
          SizedBox(height: context.space.sm),

          if (order.estimatedCompletion != null)
            _buildInfoRow(
              context,
              'Estimasi Selesai',
              DateFormat(
                'dd MMM yyyy, HH:mm',
                'id_ID',
              ).format(order.estimatedCompletion!),
              Icons.schedule_outlined,
            ),

          SizedBox(height: context.space.sm),
          _buildInfoRow(
            context,
            'Status Pembayaran',
            '',
            Icons.payment_outlined,
            trailing: PaymentStatusBadge(status: order.paymentStatus),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value,
    IconData icon, {
    Widget? trailing,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: context.colors.textTertiary),
        SizedBox(width: context.space.sm),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: context.typography.bodyMedium.copyWith(
                  color: context.colors.textTertiary,
                ),
              ),
              trailing ??
                  Flexible(
                    child: Text(
                      value,
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.textPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOrderItemsSection(
    BuildContext context,
    Order order,
    bool isPending,
    bool isInProgress,
  ) {
    final items = order.orderItems ?? [];

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.lg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Item Order',
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: context.colors.textPrimary,
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.sm,
                  vertical: context.space.xs,
                ),
                decoration: BoxDecoration(
                  color: context.colors.primarySurface,
                  borderRadius: context.radius.all.sm,
                ),
                child: Text(
                  '${items.length} Item',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          const AppDivider(),
          SizedBox(height: context.space.md),

          if (items.isEmpty)
            Center(
              child: Padding(
                padding: EdgeInsets.all(context.space.lg),
                child: Text(
                  'Tidak ada item order',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textTertiary,
                  ),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: items.length,
              separatorBuilder: (context, index) =>
                  SizedBox(height: context.space.sm),
              itemBuilder: (context, index) {
                final item = items[index];
                return _buildOrderItemCard(
                  context,
                  item,
                  isPending,
                  isInProgress,
                );
              },
            ),

          if (isPending) ...[
            SizedBox(height: context.space.md),
            Container(
              padding: EdgeInsets.all(context.space.sm),
              decoration: BoxDecoration(
                color: context.colors.warning.withValues(alpha: 0.1),
                borderRadius: context.radius.all.sm,
                border: Border.all(
                  color: context.colors.warning.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 16,
                    color: context.colors.warning,
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Text(
                      'Order masih pending. Mulai order terlebih dahulu untuk melihat proses produksi.',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.warning,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          if (isInProgress) ...[
            SizedBox(height: context.space.md),
            Container(
              padding: EdgeInsets.all(context.space.sm),
              decoration: BoxDecoration(
                color: context.colors.info.withValues(alpha: 0.1),
                borderRadius: context.radius.all.sm,
                border: Border.all(
                  color: context.colors.info.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.touch_app_outlined,
                    size: 16,
                    color: context.colors.info,
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Text(
                      'Klik item untuk melihat detail proses produksi',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.info,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderItemCard(
    BuildContext context,
    OrderItem item,
    bool isPending,
    bool isInProgress,
  ) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    final isClickable = isInProgress;

    return InkWell(
      onTap: isClickable
          ? () {
              _showProcessDetail(context, item);
            }
          : null,
      borderRadius: context.radius.all.md,
      child: Container(
        padding: EdgeInsets.all(context.space.md),
        decoration: BoxDecoration(
          color: isPending
              ? context.colors.surfaceVariant.withValues(alpha: 0.5)
              : context.colors.surfaceVariant,
          borderRadius: context.radius.all.md,
          border: Border.all(
            color: isClickable
                ? context.colors.primary.withValues(alpha: 0.2)
                : context.colors.border,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.sm,
                    vertical: context.space.xs,
                  ),
                  decoration: BoxDecoration(
                    color: context.colors.primary.withValues(alpha: 0.1),
                    borderRadius: context.radius.all.sm,
                  ),
                  child: Text(
                    item.categoryName ?? '-',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const Spacer(),
                if (isClickable)
                  Icon(
                    Icons.chevron_right,
                    color: context.colors.primary,
                    size: 20,
                  ),
              ],
            ),
            SizedBox(height: context.space.sm),

            Text(
              item.laundryServiceName ?? '-',
              style: context.typography.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
                color: isPending
                    ? context.colors.textSecondary
                    : context.colors.textPrimary,
              ),
            ),
            SizedBox(height: context.space.xs),

            Row(
              children: [
                Icon(
                  Icons.inventory_2_outlined,
                  size: 16,
                  color: context.colors.textTertiary,
                ),
                SizedBox(width: context.space.xs),
                Text(
                  '${item.quantity} ${item.unitName}',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                SizedBox(width: context.space.md),
                Icon(
                  Icons.attach_money,
                  size: 16,
                  color: context.colors.textTertiary,
                ),
                SizedBox(width: context.space.xs),
                Text(
                  formatter.format(item.unitPrice),
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.sm),
            const AppDivider(),
            SizedBox(height: context.space.sm),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  formatter.format(item.totalAmount),
                  style: context.typography.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),
              ],
            ),

            if (isInProgress && item.orderItemProcesses != null) ...[
              SizedBox(height: context.space.sm),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.sm,
                  vertical: context.space.xs,
                ),
                decoration: BoxDecoration(
                  color: context.colors.info.withValues(alpha: 0.1),
                  borderRadius: context.radius.all.sm,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.list_alt, size: 14, color: context.colors.info),
                    SizedBox(width: context.space.xs),
                    Text(
                      '${item.orderItemProcesses!.length} Proses',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.info,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildOrderSummary(BuildContext context, Order order) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.lg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ringkasan Pembayaran',
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textPrimary,
            ),
          ),
          SizedBox(height: context.space.md),
          const AppDivider(),
          SizedBox(height: context.space.md),

          _buildSummaryRow(
            context,
            'Subtotal',
            formatter.format(order.subtotal),
          ),
          if (order.discountAmount > 0) ...[
            SizedBox(height: context.space.sm),
            _buildSummaryRow(
              context,
              'Diskon',
              '- ${formatter.format(order.discountAmount)}',
              isNegative: true,
            ),
          ],
          if (order.taxAmount > 0) ...[
            SizedBox(height: context.space.sm),
            _buildSummaryRow(
              context,
              'Pajak',
              formatter.format(order.taxAmount),
            ),
          ],
          SizedBox(height: context.space.sm),
          const AppDivider(),
          SizedBox(height: context.space.sm),

          _buildSummaryRow(
            context,
            'Total',
            formatter.format(order.totalAmount),
            isBold: true,
          ),
          SizedBox(height: context.space.sm),
          _buildSummaryRow(
            context,
            'Dibayar',
            formatter.format(order.paidAmount),
            textColor: context.colors.success,
          ),
          if (order.remainingAmount > 0) ...[
            SizedBox(height: context.space.sm),
            _buildSummaryRow(
              context,
              'Sisa',
              formatter.format(order.remainingAmount),
              textColor: context.colors.error,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSummaryRow(
    BuildContext context,
    String label,
    String value, {
    bool isBold = false,
    bool isNegative = false,
    Color? textColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: context.typography.bodyMedium.copyWith(
            color: textColor ?? context.colors.textSecondary,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: context.typography.bodyMedium.copyWith(
            color:
                textColor ??
                (isNegative
                    ? context.colors.error
                    : context.colors.textPrimary),
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildNotesSection(BuildContext context, Order order) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.lg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.note_outlined,
                size: 20,
                color: context.colors.textSecondary,
              ),
              SizedBox(width: context.space.sm),
              Text(
                'Catatan',
                style: context.typography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: context.colors.textPrimary,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.sm),
          Text(
            order.notes!,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrintButton(BuildContext context, Order order) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(top: BorderSide(color: context.colors.border)),
      ),
      child: SafeArea(
        child: AppButton.primary(
          label: 'Cetak',
          icon: const Icon(Icons.print),
          isFullWidth: true,
          onPressed: () => showPrintModal(context, orderId: order.id),
        ),
      ),
    );
  }

  void _showProcessDetail(BuildContext context, OrderItem item) {
    context.push('/order-items/${item.id}');
  }
}
